import { conflict, notFound } from "../../lib/httpError.js";
import * as staffRepository from "./staff.repository.js";

export function listStaff() {
  return staffRepository.findAll();
}

export async function getStaff(id) {
  const staff = await staffRepository.findById(id);
  if (!staff) {
    throw notFound("Staff member not found.");
  }
  return staff;
}

export function createStaff(data) {
  return staffRepository.create(data);
}

export async function updateStaff(id, data) {
  await getStaff(id);
  return staffRepository.update(id, data);
}

// Root-cause fix for the old app's crash: deleting a person who still owns
// devices is a real conflict, not something to paper over. We surface it as
// an explicit, actionable 409 instead of letting a dangling foreign key
// null-reference crash the dashboard (or silently orphaning devices).
export async function deleteStaff(id) {
  await getStaff(id);

  const ownedDeviceCount = await staffRepository.countOwnedDevices(id);
  if (ownedDeviceCount > 0) {
    throw conflict(
      `Cannot delete staff member: ${ownedDeviceCount} device(s) are still assigned to them. Reassign or remove those devices first.`
    );
  }

  await staffRepository.remove(id);
}
