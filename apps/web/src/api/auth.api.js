import { httpClient } from "./httpClient";

export async function register({ name, email, password }) {
  const { data } = await httpClient.post("/auth/register", { name, email, password });
  return data;
}

export async function login({ email, password }) {
  const { data } = await httpClient.post("/auth/login", { email, password });
  return data;
}

export async function refresh() {
  const { data } = await httpClient.post("/auth/refresh");
  return data;
}

export async function logout() {
  await httpClient.post("/auth/logout");
}
