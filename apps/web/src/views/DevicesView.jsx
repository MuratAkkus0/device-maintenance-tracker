import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useDeviceList } from "../hooks/useDeviceList";
import { useDeviceInteractions } from "../hooks/useDeviceInteractions";
import DeviceList from "../components/DeviceList";
import DeviceDetailModal from "../components/DeviceDetailModal";
import ConfirmDialog from "../components/ConfirmDialog";

function DevicesView() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const allList = useDeviceList({ pageSize: 200 });

  const {
    selectedDevice,
    setSelectedDevice,
    deviceToDelete,
    setDeviceToDelete,
    isDeleting,
    sendingReminderId,
    syncDevice,
    handleSendReminder,
    handleConfirmDelete,
  } = useDeviceInteractions([allList]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Devices</h1>
          <p>Every laptop and desktop currently tracked.</p>
        </div>
        {isAdmin && (
          <Link to="/devices/new" className="btn btn-primary">
            Add device
          </Link>
        )}
      </div>

      <DeviceList
        title="All devices"
        devices={allList.devices}
        isLoading={allList.isLoading}
        error={allList.error}
        onRetry={allList.refetch}
        emptyMessage="No devices have been added yet."
        isAdmin={isAdmin}
        onSelectDevice={setSelectedDevice}
        onDeleteDevice={setDeviceToDelete}
        onSendReminder={handleSendReminder}
        sendingReminderId={sendingReminderId}
      />

      {selectedDevice && (
        <DeviceDetailModal
          device={selectedDevice}
          isAdmin={isAdmin}
          onClose={() => setSelectedDevice(null)}
          onEdit={(device) => navigate(`/devices/${device.id}/edit`)}
          onDeleteRequest={setDeviceToDelete}
          onDeviceUpdated={syncDevice}
        />
      )}

      <ConfirmDialog
        open={Boolean(deviceToDelete)}
        title="Delete device"
        description={deviceToDelete ? `Delete ${deviceToDelete.name}? This cannot be undone.` : ""}
        confirmLabel="Delete"
        isBusy={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeviceToDelete(null)}
      />
    </>
  );
}

export default DevicesView;
