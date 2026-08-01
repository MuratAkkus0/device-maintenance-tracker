// The API has no "list all technicians" endpoint (only a device's assigned
// technician is exposed, nested on the device DTO - see apps/api's
// devices.repository.js DEVICE_INCLUDE). Until one exists, the device form's
// technician dropdown is derived from technicians already on file across
// the currently loaded devices, plus the signed-in user if they are a
// technician themselves. This is a pragmatic workaround, not a full
// directory - see the handoff notes for the recommended backend addition.
export function deriveTechnicianOptions(devices, currentUser) {
  const byId = new Map();

  for (const device of devices) {
    if (device.technician) {
      byId.set(device.technician.id, device.technician);
    }
  }

  if (currentUser?.role === "TECHNICIAN" && !byId.has(currentUser.id)) {
    byId.set(currentUser.id, { id: currentUser.id, name: currentUser.name, email: currentUser.email });
  }

  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
}
