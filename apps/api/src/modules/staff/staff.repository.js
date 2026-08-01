import { prisma } from "../../db/prismaClient.js";

export function findAll() {
  return prisma.staff.findMany({ orderBy: { lastName: "asc" } });
}

export function findById(id) {
  return prisma.staff.findUnique({ where: { id } });
}

export function create(data) {
  return prisma.staff.create({ data });
}

export function update(id, data) {
  return prisma.staff.update({ where: { id }, data });
}

export function remove(id) {
  return prisma.staff.delete({ where: { id } });
}

export function countOwnedDevices(staffId) {
  return prisma.device.count({ where: { ownerStaffId: staffId } });
}
