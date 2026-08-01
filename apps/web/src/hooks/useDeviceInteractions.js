import { useState } from "react";
import { toast } from "react-toastify";
import * as devicesApi from "../api/devices.api";
import { getErrorMessage } from "../api/errors";

// Shared select/delete/send-reminder behavior for any view that renders one
// or more <DeviceList>s (Dashboard shows two, the Devices view shows one) so
// a mutation on a device is reflected everywhere it appears without a
// full-page refetch.
export function useDeviceInteractions(lists) {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sendingReminderId, setSendingReminderId] = useState(null);

  function syncDevice(device) {
    lists.forEach((list) => list.upsertDevice(device));
    setSelectedDevice((current) => (current && current.id === device.id ? device : current));
  }

  function removeDeviceEverywhere(id) {
    lists.forEach((list) => list.removeDevice(id));
  }

  async function handleSendReminder(device) {
    setSendingReminderId(device.id);
    try {
      await devicesApi.notifyDevice(device.id);
      toast.success(`Reminder email sent to ${device.technician?.name ?? "the technician"}.`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not send the reminder email."));
    } finally {
      setSendingReminderId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deviceToDelete) return;
    setIsDeleting(true);
    try {
      await devicesApi.deleteDevice(deviceToDelete.id);
      removeDeviceEverywhere(deviceToDelete.id);
      toast.success("Device deleted successfully.");
      setSelectedDevice((current) => (current?.id === deviceToDelete.id ? null : current));
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete this device."));
    } finally {
      // Always dismiss the confirmation dialog - on success the card is
      // gone, on failure the toast already explains why, so leaving the
      // modal stuck open (blocking the rest of the page) serves no one.
      setDeviceToDelete(null);
      setIsDeleting(false);
    }
  }

  return {
    selectedDevice,
    setSelectedDevice,
    deviceToDelete,
    setDeviceToDelete,
    isDeleting,
    sendingReminderId,
    syncDevice,
    handleSendReminder,
    handleConfirmDelete,
  };
}
