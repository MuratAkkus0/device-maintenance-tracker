// Realistic local/demo dataset. Safe to run more than once: every insert is
// either an upsert on a natural unique key, or guarded by a row-count check
// so reseeding never creates duplicates.
//
// The seeded accounts below are throwaway local-dev credentials, not real
// secrets - rotate them (or seed your own) before deploying anywhere beyond
// a local machine.
import bcrypt from "bcryptjs";
import { prisma } from "../src/db/prismaClient.js";
import { calculateNextDueDate } from "@wartungstermine/shared";

const SEED_PASSWORD = "ChangeMe123!";

async function upsertUser({ email, name, role }) {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, role, passwordHash },
  });
}

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function main() {
  const admin = await upsertUser({
    email: "admin@nordlicht-it.example",
    name: "Alexandra Voss",
    role: "ADMIN",
  });

  const technicianA = await upsertUser({
    email: "j.hansen@nordlicht-it.example",
    name: "Jonas Hansen",
    role: "TECHNICIAN",
  });

  const technicianB = await upsertUser({
    email: "m.schröder@nordlicht-it.example",
    name: "Mira Schröder",
    role: "TECHNICIAN",
  });

  const rooms = await Promise.all(
    ["Server Room", "Open Office 1", "Open Office 2", "Conference Room A"].map((name) =>
      prisma.room.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  let staff = await prisma.staff.findMany();
  if (staff.length === 0) {
    staff = await Promise.all(
      [
        { firstName: "Lena", lastName: "Berger", department: "Finance" },
        { firstName: "Tobias", lastName: "Krüger", department: "Engineering" },
        { firstName: "Sophie", lastName: "Neumann", department: "Sales" },
        { firstName: "Felix", lastName: "Bauer", department: "Engineering" },
        { firstName: "Marie", lastName: "Wolf", department: "HR" },
      ].map((data) => prisma.staff.create({ data }))
    );
  }

  const existingDeviceCount = await prisma.device.count();
  if (existingDeviceCount === 0) {
    const technicians = [technicianA, technicianB];

    const deviceSeeds = [
      // Overdue laptop.
      {
        type: "LAPTOP",
        ownerStaffId: staff[0].id,
        maintenanceIntervalMonths: 6,
        lastServiceDate: daysAgo(400),
        purchaseDate: daysAgo(900),
        macAddress: "00:1A:2B:3C:4D:5E",
      },
      // Due-soon laptop.
      {
        type: "LAPTOP",
        ownerStaffId: staff[1].id,
        maintenanceIntervalMonths: 12,
        lastServiceDate: daysAgo(355),
        purchaseDate: daysAgo(700),
      },
      // Comfortably OK laptop.
      {
        type: "LAPTOP",
        ownerStaffId: staff[2].id,
        maintenanceIntervalMonths: 12,
        lastServiceDate: daysAgo(30),
        purchaseDate: daysAgo(200),
      },
      // Overdue desktop in the server room.
      {
        type: "DESKTOP",
        roomId: rooms[0].id,
        maintenanceIntervalMonths: 3,
        lastServiceDate: daysAgo(200),
        purchaseDate: daysAgo(1000),
      },
      // OK desktop.
      {
        type: "DESKTOP",
        roomId: rooms[1].id,
        maintenanceIntervalMonths: 24,
        lastServiceDate: daysAgo(60),
        purchaseDate: daysAgo(500),
      },
      // Due-soon laptop for the second staff member's spare device.
      {
        type: "LAPTOP",
        ownerStaffId: staff[3].id,
        maintenanceIntervalMonths: 6,
        lastServiceDate: daysAgo(170),
        purchaseDate: daysAgo(400),
      },
      // OK desktop.
      {
        type: "DESKTOP",
        roomId: rooms[3].id,
        maintenanceIntervalMonths: 12,
        lastServiceDate: daysAgo(10),
        purchaseDate: daysAgo(365),
      },
    ];

    await Promise.all(
      deviceSeeds.map((seed, index) =>
        prisma.device.create({
          data: {
            type: seed.type,
            ownerStaffId: seed.ownerStaffId ?? null,
            roomId: seed.roomId ?? null,
            macAddress: seed.macAddress ?? null,
            purchaseDate: seed.purchaseDate,
            maintenanceIntervalMonths: seed.maintenanceIntervalMonths,
            lastServiceDate: seed.lastServiceDate,
            nextDueDate: calculateNextDueDate(seed.lastServiceDate, seed.maintenanceIntervalMonths),
            technicianId: technicians[index % technicians.length].id,
          },
        })
      )
    );
  }

  console.log("Seed complete.");
  console.log(`  Admin login:      ${admin.email} / ${SEED_PASSWORD}`);
  console.log(`  Technician login: ${technicianA.email} / ${SEED_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
