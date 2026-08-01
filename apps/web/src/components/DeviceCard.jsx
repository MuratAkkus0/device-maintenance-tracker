import { FaComputer } from "react-icons/fa6";
import { GiLaptop } from "react-icons/gi";
import { MdDeleteForever, MdOutlineMailOutline } from "react-icons/md";
import StatusBadge from "./StatusBadge";

function formatOwner(device) {
  if (device.type === "LAPTOP") {
    return device.owner ? `${device.owner.firstName} ${device.owner.lastName}` : "Unassigned";
  }
  return device.room ? device.room.name : "Unassigned";
}

function DeviceCard({ device, isAdmin, onSelect, onDelete, onSendReminder, isSendingReminder }) {
  const isLaptop = device.type === "LAPTOP";

  return (
    <div className="device-card" role="listitem">
      {isAdmin && (
        <button
          type="button"
          className="icon-btn device-card__delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(device);
          }}
          aria-label={`Delete ${device.name}`}
        >
          <MdDeleteForever aria-hidden="true" size={22} />
        </button>
      )}

      <button
        type="button"
        className="device-card__open"
        onClick={() => onSelect(device)}
        aria-label={`View details for ${device.name}`}
      >
        <div className="device-card__top">
          {isLaptop ? (
            <GiLaptop className="device-card__icon" aria-hidden="true" />
          ) : (
            <FaComputer className="device-card__icon" aria-hidden="true" />
          )}
          <StatusBadge status={device.maintenanceStatus} />
        </div>

        <div className="device-card__title">{device.name}</div>

        <div className="device-card__meta">
          <strong>{isLaptop ? "Owner" : "Room"}:</strong> {formatOwner(device)}
        </div>
        <div className="device-card__meta">
          <strong>Next maintenance:</strong>{" "}
          {new Date(device.nextDueDate).toLocaleDateString()}
        </div>
      </button>

      <div className="device-card__actions">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            onSendReminder(device);
          }}
          disabled={isSendingReminder}
        >
          <MdOutlineMailOutline aria-hidden="true" />
          {isSendingReminder ? "Sending..." : "Send reminder"}
        </button>
      </div>
    </div>
  );
}

export default DeviceCard;
