# Wartungstermine API

Express 5 + Prisma/PostgreSQL backend for the IT device maintenance tracker.
Replaces the previous 305-line, unauthenticated `api/index.js` mail relay and
the `localStorage`-only data model with a real, module-based service.

## Architecture

```
src/
  config/env.js            fail-fast environment validation (zod)
  db/prismaClient.js        Prisma client (pg adapter)
  lib/                      jwt, password hashing helpers, logger, http errors
  middleware/                auth, requireRole, validate, error handler
  modules/
    auth/                   register, login, refresh, logout (httpOnly refresh cookie)
    devices/                CRUD + server-side due/overdue query
    rooms/                  CRUD, delete-blocked while devices reference the room
    staff/                  CRUD, delete-blocked while devices reference the staff member
    maintenance/            append-only service history, recomputes nextDueDate
    notifications/          idempotent technician email reminders
  jobs/notificationScheduler.js   node-cron wrapper around the notification sweep
```

Controllers only touch `req`/`res` and call a service; services contain the
business logic and never see `req`/`res`; repositories are the only files
that call Prisma directly.

## Data model highlights

- `Device.nextDueDate` is computed by `@wartungstermine/shared`'s
  `calculateNextDueDate` (last service date + interval, clamped correctly at
  month boundaries) and stored on write, which is what makes the due/overdue
  list a plain indexed `WHERE nextDueDate <= ...` query instead of
  client-side filtering.
- A completed service is logged as a new, immutable `MaintenanceRecord`; it
  is never an overwrite of a single "last care date" field.
- Deleting a `Staff`/`Room` that still has devices assigned to it returns
  `409 Conflict` with an actionable message instead of crashing or silently
  orphaning the device (root-cause fix for the old dashboard's white screen).
- `NotificationLog` has a unique `(deviceId, notificationDate)` constraint,
  which is the idempotency guard for the reminder job: two overlapping runs
  race on the same insert and only one wins.

## Auth

- `POST /api/auth/register` - public, always creates a `TECHNICIAN` (role is
  never accepted from the client - only the seed script/an existing ADMIN can
  create an ADMIN).
- `POST /api/auth/login` - returns a short-lived JWT access token in the
  response body and sets a rotatable, revocable refresh token as an
  `httpOnly` cookie (`/api/auth` path only).
- `POST /api/auth/refresh` - rotates the refresh token and issues a new
  access token.
- `POST /api/auth/logout` - revokes the refresh token.
- Every other route requires `Authorization: Bearer <accessToken>`.

Roles: `ADMIN` (full CRUD, including deleting devices/rooms/staff) and
`TECHNICIAN` (read everything, log maintenance, trigger a reminder email;
cannot create/update/delete devices, rooms or staff).

## Notifications

`POST /api/devices/:id/notify` sends a reminder to the device's on-file
technician right now (replaces the old open `POST /send_mail`): the
recipient is always the device's `technician` relation, never a
client-supplied address, and the request is authenticated and rate limited.

`POST /api/notifications/run` (ADMIN only) manually triggers the same sweep
the cron job runs on `NOTIFICATION_CRON_SCHEDULE` (default: daily at 07:00),
for devices that are overdue or inside `NOTIFICATION_DUE_SOON_DAYS`. Both
paths are idempotent per device per calendar day.

## Running locally

```bash
cp .env.example .env        # then fill in real secrets
pnpm install
pnpm exec prisma migrate dev
pnpm run seed
pnpm run dev
```

Or via Docker Compose from the repo root (spins up Postgres, Mailpit and the
API):

```bash
docker compose up --build
```

## Tests

```bash
pnpm test
```

- `packages/shared/src/utils/nextDueDate.test.js` - the next-due-date
  calculation, including month-overflow edge cases.
- `apps/api/tests/unit/notificationIdempotency.test.js` - the notification
  job never sends twice for the same device/day, including a concurrent-run
  scenario.
- `apps/api/tests/unit/devicesAuthorization.test.js` - a `TECHNICIAN` gets
  `403` deleting a device; an `ADMIN` succeeds; an unauthenticated request
  gets `401`.
