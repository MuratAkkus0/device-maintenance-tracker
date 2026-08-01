// Device taxonomy shared between the API (Prisma enum) and the web app
// (form options, labels). Keep in sync with the `DeviceType` enum in
// apps/api/prisma/schema.prisma.
export const DEVICE_TYPES = Object.freeze({
  LAPTOP: "LAPTOP",
  DESKTOP: "DESKTOP",
});

export const DEVICE_TYPE_VALUES = Object.values(DEVICE_TYPES);

// Server-side maintenance status buckets. "dueSoon" starts this many days
// before the computed next-due date; anything before today is "overdue".
export const DUE_SOON_WINDOW_DAYS = 14;

export const MAINTENANCE_STATUS = Object.freeze({
  OVERDUE: "OVERDUE",
  DUE_SOON: "DUE_SOON",
  OK: "OK",
});
