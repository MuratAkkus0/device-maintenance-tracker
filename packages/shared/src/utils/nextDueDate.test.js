import { describe, expect, it } from "vitest";
import {
  addMonthsClamped,
  calculateNextDueDate,
  getMaintenanceStatus,
} from "./nextDueDate.js";
import { MAINTENANCE_STATUS } from "../constants/devices.js";

describe("addMonthsClamped", () => {
  it("adds whole months for a mid-month date", () => {
    const result = addMonthsClamped(new Date("2026-03-15T00:00:00.000Z"), 3);
    expect(result.toISOString()).toBe("2026-06-15T00:00:00.000Z");
  });

  it("clamps to the last day of a shorter target month instead of overflowing", () => {
    // 2026-01-31 + 1 month must land on 2026-02-28 (non-leap year), not
    // 2026-03-03 like naive Date#setMonth arithmetic would produce.
    const result = addMonthsClamped(new Date("2026-01-31T00:00:00.000Z"), 1);
    expect(result.toISOString()).toBe("2026-02-28T00:00:00.000Z");
  });

  it("clamps to Feb 29 in a leap year", () => {
    const result = addMonthsClamped(new Date("2028-01-31T00:00:00.000Z"), 1);
    expect(result.toISOString()).toBe("2028-02-29T00:00:00.000Z");
  });

  it("rolls over into the following year", () => {
    const result = addMonthsClamped(new Date("2026-11-30T00:00:00.000Z"), 3);
    expect(result.toISOString()).toBe("2027-02-28T00:00:00.000Z");
  });

  it("throws on an invalid date", () => {
    expect(() => addMonthsClamped("not-a-date", 1)).toThrow(TypeError);
  });
});

describe("calculateNextDueDate", () => {
  it("adds the maintenance interval to the last service date", () => {
    const result = calculateNextDueDate("2026-01-01T00:00:00.000Z", 6);
    expect(result.toISOString()).toBe("2026-07-01T00:00:00.000Z");
  });

  it("does NOT clamp the result to today when the device is overdue", () => {
    // Root-cause fix: the original localStorage prototype silently snapped
    // any overdue date to "today", which made overdue devices
    // indistinguishable from on-time ones. The real due date must be
    // preserved so overdue-ness can be derived from it.
    const longAgo = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000);
    const result = calculateNextDueDate(longAgo, 1);
    expect(result.getTime()).toBeLessThan(Date.now());
  });

  it("rejects a non-positive interval", () => {
    expect(() => calculateNextDueDate("2026-01-01", 0)).toThrow(RangeError);
    expect(() => calculateNextDueDate("2026-01-01", -3)).toThrow(RangeError);
  });
});

describe("getMaintenanceStatus", () => {
  const reference = new Date("2026-08-01T00:00:00.000Z");

  it("returns OVERDUE when the due date is in the past", () => {
    const dueDate = new Date("2026-07-01T00:00:00.000Z");
    expect(getMaintenanceStatus(dueDate, reference)).toBe(MAINTENANCE_STATUS.OVERDUE);
  });

  it("returns DUE_SOON within the due-soon window", () => {
    const dueDate = new Date("2026-08-10T00:00:00.000Z");
    expect(getMaintenanceStatus(dueDate, reference)).toBe(MAINTENANCE_STATUS.DUE_SOON);
  });

  it("returns OK when comfortably beyond the due-soon window", () => {
    const dueDate = new Date("2026-12-01T00:00:00.000Z");
    expect(getMaintenanceStatus(dueDate, reference)).toBe(MAINTENANCE_STATUS.OK);
  });

  it("treats the reference instant itself as DUE_SOON (due right now, not yet overdue)", () => {
    expect(getMaintenanceStatus(reference, reference)).toBe(MAINTENANCE_STATUS.DUE_SOON);
  });
});
