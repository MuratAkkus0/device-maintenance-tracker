import { httpClient } from "./httpClient";

export async function listRooms() {
  const { data } = await httpClient.get("/rooms");
  return data;
}

export async function createRoom(payload) {
  const { data } = await httpClient.post("/rooms", payload);
  return data;
}

export async function updateRoom(id, payload) {
  const { data } = await httpClient.put(`/rooms/${id}`, payload);
  return data;
}

export async function deleteRoom(id) {
  await httpClient.delete(`/rooms/${id}`);
}
