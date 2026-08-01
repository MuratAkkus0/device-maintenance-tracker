import { prisma } from "../../db/prismaClient.js";

export function listByDevice(deviceId) {
  return prisma.maintenanceRecord.findMany({
    where: { deviceId },
    orderBy: { performedAt: "desc" },
    include: { performedBy: { select: { id: true, name: true, email: true } } },
  });
}

// Logging a completed service and updating the device's rolling
// lastServiceDate/nextDueDate must succeed or fail together: a record with
// no matching device state update (or vice versa) would leave the schedule
// inconsistent with its own history.
export function logMaintenance({ deviceId, performedAt, notes, performedById, deviceUpdate }) {
  return prisma.$transaction(async (tx) => {
    const record = await tx.maintenanceRecord.create({
      data: { deviceId, performedAt, notes, performedById },
      include: { performedBy: { select: { id: true, name: true, email: true } } },
    });

    await tx.device.update({ where: { id: deviceId }, data: deviceUpdate });

    return record;
  });
}
