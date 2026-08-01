import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import * as devicesApi from "../api/devices.api";
import { getErrorMessage } from "../api/errors";
import StatusBadge from "./StatusBadge";
import TextField from "./forms/TextField";
import TextAreaField from "./forms/TextAreaField";

const today = new Date().toISOString().slice(0, 10);

function formatLocation(device) {
  if (device.type === "LAPTOP") {
    return device.owner
      ? `${device.owner.firstName} ${device.owner.lastName} (${device.owner.department})`
      : "Unassigned";
  }
  return device.room ? device.room.name : "Unassigned";
}

function DeviceDetailModal({ device, isAdmin, onClose, onEdit, onDeleteRequest, onDeviceUpdated }) {
  const dialogRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [performedAt, setPerformedAt] = useState(today);
  const [notes, setNotes] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const [logError, setLogError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  useEffect(() => {
    if (!device) return;
    let cancelled = false;
    setIsHistoryLoading(true);
    setHistoryError("");
    devicesApi
      .listMaintenanceRecords(device.id)
      .then((records) => {
        if (!cancelled) setHistory(records);
      })
      .catch((error) => {
        if (!cancelled) setHistoryError(getErrorMessage(error, "Could not load maintenance history."));
      })
      .finally(() => {
        if (!cancelled) setIsHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [device]);

  if (!device) return null;

  async function handleLogMaintenance(e) {
    e.preventDefault();
    setIsLogging(true);
    setLogError("");
    try {
      const result = await devicesApi.logMaintenance(device.id, {
        performedAt,
        notes: notes.trim() || undefined,
      });
      setHistory((prev) => [result.record, ...prev]);
      onDeviceUpdated(result.device);
      setNotes("");
      setPerformedAt(today);
      toast.success("Maintenance logged.");
    } catch (error) {
      setLogError(getErrorMessage(error, "Could not log maintenance."));
    } finally {
      setIsLogging(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="app-dialog"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby="device-detail-title"
    >
      <div className="app-dialog__header">
        <h2 id="device-detail-title">{device.name}</h2>
        <StatusBadge status={device.maintenanceStatus} />
      </div>
      <div className="app-dialog__body">
        <div className="device-detail__grid">
          <div>
            <div className="device-detail__label">Type</div>
            <div>{device.type === "LAPTOP" ? "Laptop" : "Desktop"}</div>
          </div>
          <div>
            <div className="device-detail__label">{device.type === "LAPTOP" ? "Owner" : "Room"}</div>
            <div>{formatLocation(device)}</div>
          </div>
          <div>
            <div className="device-detail__label">Technician</div>
            <div>{device.technician ? device.technician.name : "-"}</div>
          </div>
          <div>
            <div className="device-detail__label">MAC address</div>
            <div>{device.macAddress || "-"}</div>
          </div>
          <div>
            <div className="device-detail__label">Purchase date</div>
            <div>{new Date(device.purchaseDate).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="device-detail__label">Maintenance interval</div>
            <div>Every {device.maintenanceIntervalMonths} month(s)</div>
          </div>
          <div>
            <div className="device-detail__label">Last service</div>
            <div>{new Date(device.lastServiceDate).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="device-detail__label">Next due</div>
            <div>{new Date(device.nextDueDate).toLocaleDateString()}</div>
          </div>
        </div>

        <h3>Maintenance history</h3>
        {isHistoryLoading && <p>Loading history...</p>}
        {historyError && (
          <p role="alert" className="field-error">
            {historyError}
          </p>
        )}
        {!isHistoryLoading && !historyError && history.length === 0 && (
          <p className="field-hint">No maintenance has been logged yet.</p>
        )}
        {!isHistoryLoading && history.length > 0 && (
          <ul className="maintenance-history">
            {history.map((record) => (
              <li key={record.id}>
                <time dateTime={record.performedAt}>
                  {new Date(record.performedAt).toLocaleDateString()}
                </time>
                {record.performedBy && <span> - {record.performedBy.name}</span>}
                {record.notes && <p>{record.notes}</p>}
              </li>
            ))}
          </ul>
        )}

        <h3 style={{ marginTop: "1.5rem" }}>Log completed maintenance</h3>
        <form onSubmit={handleLogMaintenance} className="form-grid" style={{ marginTop: "0.5rem" }}>
          <TextField
            id="performedAt"
            label="Date performed"
            type="date"
            value={performedAt}
            onChange={(e) => setPerformedAt(e.target.value)}
            max={today}
            required
          />
          <TextAreaField
            id="notes"
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={2000}
          />
          {logError && (
            <p role="alert" className="field-error form-field--full">
              {logError}
            </p>
          )}
          <div className="form-field--full">
            <button type="submit" className="btn btn-primary" disabled={isLogging}>
              {isLogging ? "Logging..." : "Log maintenance"}
            </button>
          </div>
        </form>
      </div>
      <div className="app-dialog__footer">
        {isAdmin && (
          <>
            <button type="button" className="btn btn-danger" onClick={() => onDeleteRequest(device)}>
              Delete device
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => onEdit(device)}>
              Edit device
            </button>
          </>
        )}
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Close
        </button>
      </div>
    </dialog>
  );
}

export default DeviceDetailModal;
