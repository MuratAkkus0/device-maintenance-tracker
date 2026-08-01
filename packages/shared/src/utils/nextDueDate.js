import { DUE_SOON_WINDOW_DAYS, MAINTENANCE_STATUS } from "../constants/devices.js";

/**
 * Adds `months` calendar months to `date`, clamping the day-of-month to the
 * last valid day of the resulting month.
 *
 * Plain `Date#setMonth` overflows instead of clamping (e.g. 2026-01-31 + 1
 * month becomes 2026-03-03, not 2026-02-28), which silently corrupts
 * maintenance schedules. This is computed in UTC so the result does not
 * shift with the server's local timezone.
 */
export function addMonthsClamped(date, months) {
  const source = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(source.getTime())) {
    throw new TypeError("addMonthsClamped: invalid date");
  }

  const day = source.getUTCDate();
  const firstOfTargetMonth = new Date(
    Date.UTC(source.getUTCFullYear(), source.getUTCMonth() + months, 1)
  );

  const daysInTargetMonth = new Date(
    Date.UTC(
      firstOfTargetMonth.getUTCFullYear(),
      firstOfTargetMonth.getUTCMonth() + 1,
      0
    )
  ).getUTCDate();

  firstOfTargetMonth.setUTCDate(Math.min(day, daysInTargetMonth));
  return firstOfTargetMonth;
}

/**
 * Computes the next maintenance due date for a device.
 *
 * This is the single source of truth for the calculation: it is intentionally
 * NOT clamped to "today" when the result is in the past. Clamping would make
 * overdue devices indistinguishable from on-time ones and defeats the
 * server-side due/overdue query. Overdue-ness is derived instead by comparing
 * the returned date against `referenceDate` in `getMaintenanceStatus`.
 *
 * @param {Date|string} lastServiceDate - date of the last completed service.
 * @param {number} maintenanceIntervalMonths - service interval, in months.
 * @returns {Date} the next due date, in UTC.
 */
export function calculateNextDueDate(lastServiceDate, maintenanceIntervalMonths) {
  const interval = Number(maintenanceIntervalMonths);
  if (!Number.isFinite(interval) || interval <= 0) {
    throw new RangeError(
      "calculateNextDueDate: maintenanceIntervalMonths must be a positive number"
    );
  }

  return addMonthsClamped(lastServiceDate, interval);
}

/**
 * Buckets a device's next-due date into OVERDUE / DUE_SOON / OK relative to
 * `referenceDate` (defaults to now). Used for the colour-blind-safe status
 * badges and the server-side due-list filter.
 */
export function getMaintenanceStatus(nextDueDate, referenceDate = new Date()) {
  const due = nextDueDate instanceof Date ? nextDueDate : new Date(nextDueDate);
  const reference =
    referenceDate instanceof Date ? referenceDate : new Date(referenceDate);

  const msPerDay = 24 * 60 * 60 * 1000;
  const dueSoonThreshold = new Date(reference.getTime() + DUE_SOON_WINDOW_DAYS * msPerDay);

  if (due.getTime() < reference.getTime()) {
    return MAINTENANCE_STATUS.OVERDUE;
  }
  if (due.getTime() <= dueSoonThreshold.getTime()) {
    return MAINTENANCE_STATUS.DUE_SOON;
  }
  return MAINTENANCE_STATUS.OK;
}
