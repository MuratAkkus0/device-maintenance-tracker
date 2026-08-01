// User roles recognised by both the API (authorization) and the web app
// (conditional UI). Keep in sync with the `Role` enum in
// apps/api/prisma/schema.prisma.
export const ROLES = Object.freeze({
  ADMIN: "ADMIN",
  TECHNICIAN: "TECHNICIAN",
});

export const ROLE_VALUES = Object.values(ROLES);
