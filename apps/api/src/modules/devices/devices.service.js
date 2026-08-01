import {
  DEVICE_TYPE_VALUES,
  MAINTENANCE_STATUS,
  calculateNextDueDate,
  getMaintenanceStatus,
} from "@wartungstermine/shared";
import { env } from "../../config/env.js";
import { badRequest, notFound } from "../../lib/httpError.js";
import * as devicesRepository from "./devices.repository.js";
import * as staffRepository from "../staff/staff.repository.js";
import * as roomsRepository from "../rooms/rooms.repository.js";
import * as authRepository from "../auth/auth.repository.js";

const DUE_SOON_WINDOW_MS = env.NOTIFICATION_DUE_SOON_DAYS * 24 * 60 * 60 * 1000;

function dueSoonThreshold(reference = new Date()) {
  return new Date(reference.getTime() + DUE_SOON_WINDOW_MS);
}

// Pure function of type + id (see prisma/schema.prisma comment) plus the
// computed OVERDUE/DUE_SOON/OK status the "Alle Geräte" and due-list views
// both render.
export function toDeviceDto(device) {
  return {
    ...device,
    name: `${device.type === "LAPTOP" ? "Laptop" : "Desktop"}-${device.id}`,
    maintenanceStatus: getMaintenanceStatus(device.nextDueDate),
  };
}

// This is the server-side query the due/overdue view is built on: the
// database itself filters by the (indexed) computed nextDueDate column,
// there is no "fetch everything and filter with .filter() in the browser"
// step anywhere in this path.
export async function listDevices({ status, type, page = 1, pageSize = 50 }) {
  const where = {};

  if (type) {
    if (!DEVICE_TYPE_VALUES.includes(type)) {
      throw badRequest(`type must be one of: ${DEVICE_TYPE_VALUES.join(", ")}.`);
    }
    where.type = type;
  }

  const now = new Date();
  const threshold = dueSoonThreshold(now);

  if (status === "overdue") {
    where.nextDueDate = { lt: now };
  } else if (status === "due-soon") {
    where.nextDueDate = { gte: now, lte: threshold };
  } else if (status === "due") {
    where.nextDueDate = { lte: threshold };
  } else if (status === "ok") {
    where.nextDueDate = { gt: threshold };
  } else if (status !== undefined) {
    throw badRequest("status must be one of: overdue, due-soon, due, ok.");
  }

  const skip = (page - 1) * pageSize;
  const [devices, total] = await Promise.all([
    devicesRepository.findMany({ where, skip, take: pageSize }),
    devicesRepository.count(where),
  ]);

  return {
    data: devices.map(toDeviceDto),
    meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}

export async function getDevice(id) {
  const device = await devicesRepository.findById(id);
  if (!device) {
    throw notFound("Device not found.");
  }
  return toDeviceDto(device);
}

async function assertReferencesExist({ type, ownerStaffId, roomId, technicianId }) {
  if (type === "LAPTOP" && ownerStaffId) {
    const owner = await staffRepository.findById(ownerStaffId);
    if (!owner) throw badRequest("ownerStaffId does not reference an existing staff member.");
  }
  if (type === "DESKTOP" && roomId) {
    const room = await roomsRepository.findById(roomId);
    if (!room) throw badRequest("roomId does not reference an existing room.");
  }
  if (technicianId) {
    const technician = await authRepository.findUserById(technicianId);
    if (!technician) throw badRequest("technicianId does not reference an existing user.");
  }
}

function buildLocationFields(type, { ownerStaffId, roomId }) {
  // A laptop is owned by a person; a desktop lives in a room. Enforcing this
  // as mutually exclusive at write time (instead of trusting whichever the
  // client happened to send) is what the old localStorage version skipped.
  return type === "LAPTOP"
    ? { ownerStaffId, roomId: null }
    : { ownerStaffId: null, roomId };
}

export async function createDevice(payload) {
  await assertReferencesExist(payload);

  const nextDueDate = calculateNextDueDate(
    payload.lastServiceDate,
    payload.maintenanceIntervalMonths
  );

  const device = await devicesRepository.create({
    type: payload.type,
    macAddress: payload.macAddress || null,
    purchaseDate: new Date(payload.purchaseDate),
    maintenanceIntervalMonths: payload.maintenanceIntervalMonths,
    lastServiceDate: new Date(payload.lastServiceDate),
    nextDueDate,
    technicianId: payload.technicianId,
    ...buildLocationFields(payload.type, payload),
  });

  return toDeviceDto(device);
}

export async function updateDevice(id, payload) {
  const existing = await devicesRepository.findById(id);
  if (!existing) {
    throw notFound("Device not found.");
  }

  const merged = { ...existing, ...payload };
  await assertReferencesExist(merged);

  const data = { ...payload };
  if (payload.purchaseDate) data.purchaseDate = new Date(payload.purchaseDate);
  if (payload.lastServiceDate) data.lastServiceDate = new Date(payload.lastServiceDate);
  if (payload.macAddress !== undefined) data.macAddress = payload.macAddress || null;

  if (payload.lastServiceDate || payload.maintenanceIntervalMonths) {
    data.nextDueDate = calculateNextDueDate(
      merged.lastServiceDate,
      merged.maintenanceIntervalMonths
    );
  }

  if (payload.type || payload.ownerStaffId !== undefined || payload.roomId !== undefined) {
    Object.assign(data, buildLocationFields(merged.type, merged));
  }

  const device = await devicesRepository.update(id, data);
  return toDeviceDto(device);
}

export async function deleteDevice(id) {
  const existing = await devicesRepository.findById(id);
  if (!existing) {
    throw notFound("Device not found.");
  }
  await devicesRepository.remove(id);
}

export { MAINTENANCE_STATUS, dueSoonThreshold };
