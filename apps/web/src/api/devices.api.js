import { httpClient } from "./httpClient";

// status: "overdue" | "due-soon" | "due" | "ok"; type: "LAPTOP" | "DESKTOP".
// Filtering happens server-side (see apps/api devices.service.js) - the
// client never fetches everything and filters in the browser.
export async function listDevices(params = {}) {
  const { data } = await httpClient.get("/devices", { params });
  return data;
}

export async function getDevice(id) {
  const { data } = await httpClient.get(`/devices/${id}`);
  return data;
}

export async function createDevice(payload) {
  const { data } = await httpClient.post("/devices", payload);
  return data;
}

export async function updateDevice(id, payload) {
  const { data } = await httpClient.put(`/devices/${id}`, payload);
  return data;
}

export async function deleteDevice(id) {
  await httpClient.delete(`/devices/${id}`);
}

export async function notifyDevice(id) {
  const { data } = await httpClient.post(`/devices/${id}/notify`);
  return data;
}

export async function listMaintenanceRecords(deviceId) {
  const { data } = await httpClient.get(`/devices/${deviceId}/maintenance-records`);
  return data;
}

export async function logMaintenance(deviceId, payload) {
  const { data } = await httpClient.post(`/devices/${deviceId}/maintenance-records`, payload);
  return data;
}
