import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

// A single fake replacing the Prisma client is enough to isolate every
// module in the import chain (devices/staff/rooms/auth/maintenance/
// notifications repositories all import this same module) from a real
// database, without having to mock each repository file individually.
const fakeDevice = {
  id: 1,
  type: "LAPTOP",
  nextDueDate: new Date(),
  ownerStaffId: 7,
  roomId: null,
  technicianId: 3,
  owner: { id: 7, firstName: "Lena", lastName: "Berger" },
  room: null,
  technician: { id: 3, name: "Jonas Hansen", email: "j.hansen@nordlicht-it.example" },
};

vi.mock("../../src/db/prismaClient.js", () => ({
  prisma: {
    device: {
      findUnique: vi.fn().mockResolvedValue(fakeDevice),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue(fakeDevice),
      update: vi.fn().mockResolvedValue(fakeDevice),
      delete: vi.fn().mockResolvedValue(fakeDevice),
    },
  },
}));

const { signAccessToken } = await import("../../src/lib/jwt.js");
const devicesRoutes = (await import("../../src/modules/devices/devices.routes.js")).default;
const errorHandler = (await import("../../src/middleware/error.middleware.js")).default;

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/devices", devicesRoutes);
  app.use(errorHandler);
  return app;
}

describe("device deletion authorization", () => {
  let app;

  beforeEach(() => {
    app = buildApp();
  });

  it("returns 403 when a TECHNICIAN tries to delete a device", async () => {
    const token = signAccessToken({ id: 1, role: "TECHNICIAN" });

    const res = await request(app)
      .delete("/api/devices/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("rejects the request with no access token at all", async () => {
    const res = await request(app).delete("/api/devices/1");
    expect(res.status).toBe(401);
  });

  it("allows an ADMIN to delete a device", async () => {
    const token = signAccessToken({ id: 2, role: "ADMIN" });

    const res = await request(app)
      .delete("/api/devices/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });
});
