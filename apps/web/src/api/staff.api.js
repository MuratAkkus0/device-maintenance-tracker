import { httpClient } from "./httpClient";

export async function listStaff() {
  const { data } = await httpClient.get("/staff");
  return data;
}

export async function createStaff(payload) {
  const { data } = await httpClient.post("/staff", payload);
  return data;
}

export async function updateStaff(id, payload) {
  const { data } = await httpClient.put(`/staff/${id}`, payload);
  return data;
}

export async function deleteStaff(id) {
  await httpClient.delete(`/staff/${id}`);
}
