import { prisma } from "../../db/prismaClient.js";

const DEVICE_INCLUDE = {
  owner: { select: { id: true, firstName: true, lastName: true, department: true } },
  room: { select: { id: true, name: true } },
  technician: { select: { id: true, name: true, email: true } },
};

export function findMany({ where, skip, take }) {
  return prisma.device.findMany({
    where,
    include: DEVICE_INCLUDE,
    orderBy: { nextDueDate: "asc" },
    skip,
    take,
  });
}

export function count(where) {
  return prisma.device.count({ where });
}

export function findById(id) {
  return prisma.device.findUnique({ where: { id }, include: DEVICE_INCLUDE });
}

export function create(data) {
  return prisma.device.create({ data, include: DEVICE_INCLUDE });
}

export function update(id, data) {
  return prisma.device.update({ where: { id }, data, include: DEVICE_INCLUDE });
}

export function remove(id) {
  return prisma.device.delete({ where: { id } });
}

// Devices due for a reminder: overdue or inside the due-soon window, with a
// technician on file to notify. Used by the notification job.
export function findDueForNotification(dueSoonThreshold) {
  return prisma.device.findMany({
    where: { nextDueDate: { lte: dueSoonThreshold } },
    include: DEVICE_INCLUDE,
  });
}
