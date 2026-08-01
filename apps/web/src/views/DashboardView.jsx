import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useDeviceList } from "../hooks/useDeviceList";
import { useDeviceInteractions } from "../hooks/useDeviceInteractions";
import DeviceList from "../components/DeviceList";
import DeviceDetailModal from "../components/DeviceDetailModal";
import ConfirmDialog from "../components/ConfirmDialog";

function DashboardView() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const dueList = useDeviceList({ status: "due", pageSize: 100 });
  const allList = useDeviceList({ pageSize: 100 });

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
  } = useDeviceInteractions([dueList, allList]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of every tracked device and what needs attention.</p>
        </div>
      </div>

      <div className="dashboard-sections">
        <DeviceList
          title="Needs attention"
          devices={dueList.devices}
          isLoading={dueList.isLoading}
          error={dueList.error}
          onRetry={dueList.refetch}
          emptyMessage="Nothing is due or overdue. Everything is on schedule."
          limit={3}
          isAdmin={isAdmin}
          onSelectDevice={setSelectedDevice}
          onDeleteDevice={setDeviceToDelete}
          onSendReminder={handleSendReminder}
          sendingReminderId={sendingReminderId}
        />

        <DeviceList
          title="All devices"
          devices={allList.devices}
          isLoading={allList.isLoading}
          error={allList.error}
          onRetry={allList.refetch}
          emptyMessage="No devices have been added yet."
          limit={6}
          isAdmin={isAdmin}
          onSelectDevice={setSelectedDevice}
          onDeleteDevice={setDeviceToDelete}
          onSendReminder={handleSendReminder}
          sendingReminderId={sendingReminderId}
        />
      </div>

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

export default DashboardView;
