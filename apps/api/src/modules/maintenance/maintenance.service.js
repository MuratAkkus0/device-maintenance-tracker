import { calculateNextDueDate } from "@wartungstermine/shared";
import { notFound } from "../../lib/httpError.js";
import * as maintenanceRepository from "./maintenance.repository.js";
import * as devicesRepository from "../devices/devices.repository.js";
import { toDeviceDto } from "../devices/devices.service.js";

export async function listMaintenanceHistory(deviceId) {
  const device = await devicesRepository.findById(deviceId);
  if (!device) {
    throw notFound("Device not found.");
  }
  return maintenanceRepository.listByDevice(deviceId);
}

export async function logMaintenance(deviceId, { performedAt, notes }, performedById) {
  const device = await devicesRepository.findById(deviceId);
  if (!device) {
    throw notFound("Device not found.");
  }

  const performedAtDate = new Date(performedAt);

  // A completed service is always appended to history. It only becomes the
  // device's new "last service" (and therefore moves nextDueDate) if it is
  // the most recent one on record; a backdated entry logged after the fact
  // must not regress an already-later schedule.
  const isMostRecentService = performedAtDate >= device.lastServiceDate;

  const record = await maintenanceRepository.logMaintenance({
    deviceId,
    performedAt: performedAtDate,
    notes: notes || null,
    performedById,
    deviceUpdate: isMostRecentService
      ? {
          lastServiceDate: performedAtDate,
          nextDueDate: calculateNextDueDate(performedAtDate, device.maintenanceIntervalMonths),
        }
      : {},
  });

  const updatedDevice = await devicesRepository.findById(deviceId);
  return { record, device: toDeviceDto(updatedDevice) };
}
