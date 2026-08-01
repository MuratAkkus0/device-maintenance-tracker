import { MdCheckCircle, MdError, MdSchedule } from "react-icons/md";
import { MAINTENANCE_STATUS } from "@wartungstermine/shared";

// Status is never color-only: each state pairs a distinct icon with a
// visible text label, and the label itself (not just an aria-hidden icon)
// is what a screen reader announces.
const STATUS_CONFIG = {
  [MAINTENANCE_STATUS.OVERDUE]: {
    label: "Overdue",
    icon: MdError,
    className: "status-badge--overdue",
  },
  [MAINTENANCE_STATUS.DUE_SOON]: {
    label: "Due soon",
    icon: MdSchedule,
    className: "status-badge--due-soon",
  },
  [MAINTENANCE_STATUS.OK]: {
    label: "OK",
    icon: MdCheckCircle,
    className: "status-badge--ok",
  },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  const Icon = config.icon;
  return (
    <span className={`status-badge ${config.className}`}>
      <Icon aria-hidden="true" size={14} />
      {config.label}
    </span>
  );
}

export default StatusBadge;
