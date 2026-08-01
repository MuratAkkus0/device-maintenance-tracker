import { prisma } from "../../db/prismaClient.js";

export function findAll() {
  return prisma.room.findMany({ orderBy: { name: "asc" } });
}

export function findById(id) {
  return prisma.room.findUnique({ where: { id } });
}

export function create(data) {
  return prisma.room.create({ data });
}

export function update(id, data) {
  return prisma.room.update({ where: { id }, data });
}

export function remove(id) {
  return prisma.room.delete({ where: { id } });
}

export function countDevicesInRoom(roomId) {
  return prisma.device.count({ where: { roomId } });
}
