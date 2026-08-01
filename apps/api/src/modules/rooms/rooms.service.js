import { conflict, notFound } from "../../lib/httpError.js";
import * as roomsRepository from "./rooms.repository.js";

export function listRooms() {
  return roomsRepository.findAll();
}

export async function getRoom(id) {
  const room = await roomsRepository.findById(id);
  if (!room) {
    throw notFound("Room not found.");
  }
  return room;
}

export function createRoom(data) {
  return roomsRepository.create(data);
}

export async function updateRoom(id, data) {
  await getRoom(id);
  return roomsRepository.update(id, data);
}

export async function deleteRoom(id) {
  await getRoom(id);

  const deviceCount = await roomsRepository.countDevicesInRoom(id);
  if (deviceCount > 0) {
    throw conflict(
      `Cannot delete room: ${deviceCount} device(s) are still located in it. Reassign or remove those devices first.`
    );
  }

  await roomsRepository.remove(id);
}
