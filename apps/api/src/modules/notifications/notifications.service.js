import { getMaintenanceStatus } from "@wartungstermine/shared";
import { badRequest, notFound } from "../../lib/httpError.js";
import { logger } from "../../lib/logger.js";
import * as notificationsRepository from "./notifications.repository.js";
import * as devicesRepository from "../devices/devices.repository.js";
import { dueSoonThreshold } from "../devices/devices.service.js";
import { buildMaintenanceReminderEmail } from "./notifications.template.js";
import { sendMail } from "./notifications.mailer.js";

function locationLabelFor(device) {
  return device.type === "LAPTOP"
    ? `${device.owner?.firstName} ${device.owner?.lastName}`.trim() || "Unassigned"
    : device.room?.name || "Unassigned";
}

// The technician's recipient address always comes from the device's
// technician relation (a real, existing User row), never from a
// caller-supplied address. This is the allowlisting fix for the old
// endpoint, which sent to whatever `technicerEmail` the client posted.
async function deliver(device) {
  const { subject, html } = buildMaintenanceReminderEmail({
    device,
    locationLabel: locationLabelFor(device),
    statusLabel: getMaintenanceStatus(device.nextDueDate),
  });

  await sendMail({ to: device.technician.email, subject, html });
}

/**
 * Idempotently attempts to notify a device's technician, at most once per
 * calendar day per device. Concurrency-safe: the unique
 * (deviceId, notificationDate) constraint means two overlapping calls for
 * the same device/day race on the same insert, and only one wins the slot.
 */
async function attemptNotify(device, referenceDate = new Date()) {
  const notificationDate = notificationsRepository.toNotificationDateBucket(referenceDate);
  const claimed = await notificationsRepository.claimNotificationSlot(device.id, notificationDate);

  if (!claimed) {
    return { deviceId: device.id, sent: false, reason: "already-notified-today" };
  }

  try {
    await deliver(device);
    await notificationsRepository.markSent(claimed.id);
    return { deviceId: device.id, sent: true };
  } catch (err) {
    await notificationsRepository.markFailed(claimed.id, err.message ?? err);
    logger.error({ err, deviceId: device.id }, "Failed to send maintenance reminder email");
    return { deviceId: device.id, sent: false, reason: "send-failed" };
  }
}

// Run by the scheduled job (and available for a manual admin-triggered
// re-run): finds every device that is overdue or inside the due-soon
// window and notifies its technician, once per device per day.
export async function runDueNotificationSweep(referenceDate = new Date()) {
  const devices = await devicesRepository.findDueForNotification(dueSoonThreshold(referenceDate));
  const results = await Promise.all(devices.map((device) => attemptNotify(device, referenceDate)));

  return {
    checked: results.length,
    sent: results.filter((r) => r.sent).length,
    skipped: results.filter((r) => !r.sent && r.reason === "already-notified-today").length,
    failed: results.filter((r) => !r.sent && r.reason === "send-failed").length,
    results,
  };
}

// Manual "send now" trigger for a single device (replaces the old, open
// POST /send_mail). Reuses the same idempotency window as the automated
// sweep so repeated clicks in one day don't spam the technician's inbox.
export async function notifyDeviceNow(deviceId) {
  const device = await devicesRepository.findById(deviceId);
  if (!device) {
    throw notFound("Device not found.");
  }
  if (!device.technician?.email) {
    throw badRequest("This device has no technician assigned to notify.");
  }

  return attemptNotify(device);
}
