import { useCallback, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth.api";
import { setAccessToken, setSessionExpiredHandler } from "../api/httpClient";
import { getErrorMessage } from "../api/errors";
import { AuthContext } from "./context";

// "checking" -> attempting silent refresh on first load
// "authenticated" / "unauthenticated" are the two settled states.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("checking");

  const applySession = useCallback((session) => {
    setAccessToken(session.accessToken);
    setUser(session.user);
    setStatus("authenticated");
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(clearSession);
  }, [clearSession]);

  // On first load, try to exchange the httpOnly refresh cookie (if any) for
  // a fresh access token so a page reload doesn't force a re-login.
  useEffect(() => {
    let cancelled = false;
    authApi
      .refresh()
      .then((session) => {
        if (!cancelled) applySession(session);
      })
      .catch(() => {
        if (!cancelled) clearSession();
      });
    return () => {
      cancelled = true;
    };
  }, [applySession, clearSession]);

  const login = useCallback(
    async (credentials) => {
      try {
        const session = await authApi.login(credentials);
        applySession(session);
        return { ok: true };
      } catch (error) {
        return { ok: false, message: getErrorMessage(error, "Login failed.") };
      }
    },
    [applySession]
  );

  const register = useCallback(
    async (details) => {
      try {
        const session = await authApi.register(details);
        applySession(session);
        return { ok: true };
      } catch (error) {
        return { ok: false, message: getErrorMessage(error, "Registration failed.") };
      }
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated",
      isAdmin: user?.role === "ADMIN",
      login,
      register,
      logout,
    }),
    [user, status, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
