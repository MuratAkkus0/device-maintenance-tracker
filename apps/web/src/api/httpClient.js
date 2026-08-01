import axios from "axios";

// The API base URL must come from an env var - never hardcoded (this is
// what replaces the old app's hardcoded third-party mail relay URL). See
// apps/web/.env.example.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_BASE = `${API_URL}/api`;

let accessToken = null;
let onSessionExpired = () => {};

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

// Called by AuthContext so the interceptor below can clear client-side auth
// state when a refresh ultimately fails (refresh token revoked/expired).
export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler;
}

// withCredentials is required so the httpOnly refresh cookie (scoped to
// /api/auth) is sent with requests to the auth endpoints.
export const httpClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

httpClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Single in-flight refresh at a time: if several requests 401 at once, they
// all await the same refresh instead of each triggering their own.
let refreshInFlight = null;

function requestRefresh() {
  if (!refreshInFlight) {
    refreshInFlight = axios
      .post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const isAuthEndpoint = config?.url?.startsWith("/auth/");

    if (!response || response.status !== 401 || !config || config._retried || isAuthEndpoint) {
      return Promise.reject(error);
    }

    config._retried = true;

    try {
      const { data } = await requestRefresh();
      setAccessToken(data.accessToken);
      config.headers.Authorization = `Bearer ${data.accessToken}`;
      return httpClient(config);
    } catch (refreshError) {
      setAccessToken(null);
      onSessionExpired();
      return Promise.reject(refreshError);
    }
  }
);

export { API_BASE };
