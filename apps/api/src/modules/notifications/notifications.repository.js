import { prisma } from "../../db/prismaClient.js";

const UNIQUE_CONSTRAINT_VIOLATION = "P2002";

// Truncates to UTC midnight: the idempotency bucket is "this calendar day",
// not "this instant", so a job that reruns minutes later doesn't resend.
export function toNotificationDateBucket(date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

// Returns the created row, or null if a log for this (device, day) already
// exists - the unique constraint on NotificationLog is what makes this
// atomic even under concurrent job runs, unlike a "check then insert" that
// races between the check and the insert.
export async function claimNotificationSlot(deviceId, notificationDate) {
  try {
    return await prisma.notificationLog.create({
      data: { deviceId, notificationDate, status: "PENDING" },
    });
  } catch (err) {
    if (err.code === UNIQUE_CONSTRAINT_VIOLATION) {
      return null;
    }
    throw err;
  }
}

export function markSent(logId) {
  return prisma.notificationLog.update({
    where: { id: logId },
    data: { status: "SENT", sentAt: new Date() },
  });
}

export function markFailed(logId, error) {
  return prisma.notificationLog.update({
    where: { id: logId },
    data: { status: "FAILED", error: String(error).slice(0, 1000) },
  });
}
