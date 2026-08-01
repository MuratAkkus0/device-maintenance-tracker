import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMailMock = vi.fn().mockResolvedValue(undefined);
vi.mock("../../src/modules/notifications/notifications.mailer.js", () => ({
  sendMail: sendMailMock,
}));

// In-memory fake that mirrors the real repository's contract, including the
// unique-constraint semantics the real Postgres table enforces: a second
// claim for the same (deviceId, notificationDate) loses and gets null back.
// This is what makes attemptNotify/runDueNotificationSweep idempotent.
let store;
vi.mock("../../src/modules/notifications/notifications.repository.js", async () => {
  const actual = await vi.importActual(
    "../../src/modules/notifications/notifications.repository.js"
  );
  return {
    toNotificationDateBucket: actual.toNotificationDateBucket,
    claimNotificationSlot: vi.fn((deviceId, notificationDate) => {
      const key = `${deviceId}:${notificationDate.toISOString()}`;
      if (store.has(key)) return null;
      const row = { id: store.size + 1, deviceId, notificationDate, status: "PENDING" };
      store.set(key, row);
      return row;
    }),
    markSent: vi.fn((id) => {
      for (const row of store.values()) {
        if (row.id === id) row.status = "SENT";
      }
    }),
    markFailed: vi.fn((id, error) => {
      for (const row of store.values()) {
        if (row.id === id) {
          row.status = "FAILED";
          row.error = error;
        }
      }
    }),
  };
});

const overdueDevice = {
  id: 42,
  type: "LAPTOP",
  nextDueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  owner: { firstName: "Lena", lastName: "Berger" },
  room: null,
  technician: { email: "technician@nordlicht-it.example" },
};

vi.mock("../../src/modules/devices/devices.repository.js", () => ({
  findDueForNotification: vi.fn().mockResolvedValue([overdueDevice]),
}));

vi.mock("../../src/modules/devices/devices.service.js", () => ({
  dueSoonThreshold: (reference) => new Date(reference.getTime() + 14 * 24 * 60 * 60 * 1000),
}));

const { runDueNotificationSweep } = await import(
  "../../src/modules/notifications/notifications.service.js"
);

describe("notification job idempotency", () => {
  beforeEach(() => {
    store = new Map();
    sendMailMock.mockClear();
  });

  it("sends exactly one email the first time a device is due", async () => {
    const summary = await runDueNotificationSweep();

    expect(summary.sent).toBe(1);
    expect(summary.skipped).toBe(0);
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: "technician@nordlicht-it.example" })
    );
  });

  it("does not send a second email for the same device within the same due window", async () => {
    await runDueNotificationSweep();
    sendMailMock.mockClear();

    const secondRun = await runDueNotificationSweep();

    expect(secondRun.sent).toBe(0);
    expect(secondRun.skipped).toBe(1);
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("still sends exactly once even if two sweeps run concurrently", async () => {
    const [first, second] = await Promise.all([
      runDueNotificationSweep(),
      runDueNotificationSweep(),
    ]);

    const totalSent = first.sent + second.sent;
    expect(totalSent).toBe(1);
    expect(sendMailMock).toHaveBeenCalledTimes(1);
  });
});
