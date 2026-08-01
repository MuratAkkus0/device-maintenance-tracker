# Wartungstermine — IT Device Maintenance Tracker

A full-stack app for an IT department to track laptops/desktops, who owns or
hosts them, and when they're next due for maintenance — with role-based
access, real authentication, and email reminders. Originally a single-page
React app that read and wrote everything to `localStorage` from ~7
different components and posted to an open, unauthenticated mail relay; it
is now a proper client/server app: Express + PostgreSQL API, a React client
that talks to it over HTTP, JWT auth with rotating refresh tokens, and
role-based authorization (`ADMIN` / `TECHNICIAN`).

## Monorepo layout

```
apps/
  api/            Express 5 + Prisma/PostgreSQL backend (see apps/api/README.md)
  web/             React 18 + Vite frontend (this README covers it)
packages/
  shared/          zod schemas, roles/device-type constants, and the
                   next-due-date calculation - imported by both apps so
                   validation rules and business logic are defined once
docker-compose.yml Postgres, Mailpit, the API and the web dev server
```

Package manager is **pnpm** (workspaces defined in `pnpm-workspace.yaml`).
There is a single install path: `pnpm install` from the repo root. There is
no root `package-lock.json`/npm anywhere in the repo.

## Data model

- **User** — logs in. `role` is `ADMIN` or `TECHNICIAN`. Also the only
  entity that can be a device's `technician` (who gets reminder emails).
- **Staff** — a person who can own a laptop. Distinct from `User`: staff
  never log in, they're just an owner reference on a device.
- **Room** — a physical space a desktop can be located in.
- **Device** — `type` (`LAPTOP`/`DESKTOP`), either an `ownerStaffId`
  (laptop) or `roomId` (desktop) but never both, a `technicianId`, and a
  server-computed `nextDueDate` (last service date + interval, clamped
  correctly at month boundaries — see `packages/shared/src/utils/nextDueDate.js`).
  A device's maintenance status (`OVERDUE` / `DUE_SOON` / `OK`) is derived
  from `nextDueDate`, never stored.
- **MaintenanceRecord** — append-only service history. Logging a completed
  service creates a new record; it is never an overwrite of a single "last
  care date" field the way the old app worked.
- **NotificationLog** — one row per (device, calendar day) reminder, which
  is what makes the reminder job idempotent.

Deleting a `Staff`/`Room` that still has devices assigned to it is a
**409 Conflict** with an actionable message, not a crash — see "Bugs fixed"
below.

## Auth & roles

- `POST /api/auth/register` — public, always creates a `TECHNICIAN`
  (self-service registration can never mint an admin).
- `POST /api/auth/login` — returns a short-lived JWT **access token** in the
  response body and sets a rotating, revocable **refresh token** as an
  `httpOnly` cookie (scoped to `/api/auth`).
- `POST /api/auth/refresh` / `POST /api/auth/logout`.
- Every other route requires `Authorization: Bearer <accessToken>`.

**ADMIN**: full CRUD, including deleting devices/rooms/staff.
**TECHNICIAN**: reads everything, can log completed maintenance and trigger
a reminder email, but cannot create/update/delete devices, rooms or staff.

The web app mirrors this: the access token is kept in memory (never
`localStorage`), a silent `POST /api/auth/refresh` on load restores a
session across page reloads via the httpOnly cookie, an axios response
interceptor retries a request exactly once after a transparent refresh on
`401`, and `ProtectedRoute` redirects unauthenticated visitors to `/login`.
Role-gated UI (delete buttons, "Add device", the create/edit routes) is
driven by the same `user.role` the API returns — there is no separate
client-side permission model to keep in sync.

## Local setup

```bash
cp apps/api/.env.example apps/api/.env   # then fill in real secrets
cp apps/web/.env.example apps/web/.env   # defaults are fine for local dev
docker compose up --build
```

This starts:

| Service   | URL                                 | Notes                                      |
|-----------|--------------------------------------|----------------------------------------------|
| `web`     | http://localhost:5173                | Vite dev server                               |
| `api`     | http://localhost:4000                | Express API                                   |
| `db`      | `localhost:5435` (container: `5432`) | Postgres — **host port is 5435, not 5432**    |
| `mailpit` | http://localhost:8025                | Catches every email the API sends             |

Seed demo data (one-time, or after `docker compose down -v`):

```bash
docker compose exec api node prisma/seed.js
```

```
Admin login:      admin@nordlicht-it.example / ChangeMe123!
Technician login: j.hansen@nordlicht-it.example / ChangeMe123!
```

Without Docker: `pnpm install` at the repo root, then `pnpm --filter
@wartungstermine/api dev` and `pnpm --filter @wartungstermine/web dev`
against a Postgres instance of your own (point `DATABASE_URL` at it).

### Env vars

**`apps/api/.env`** (see `apps/api/.env.example` for the full list):
`DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`
(comma-separated allowlist — include every origin the browser will actually
use, e.g. both `http://localhost:5173` and `http://127.0.0.1:5173` if you
test with both), SMTP settings (defaults point at the Mailpit container),
`NOTIFICATION_CRON_SCHEDULE`, `NOTIFICATION_DUE_SOON_DAYS`.

**`apps/web/.env`** (see `apps/web/.env.example`):
`VITE_API_URL` — the API's base URL (no `/api` suffix). This is the only
place the API URL is configured; there is no hardcoded API/mail-relay URL
anywhere in the client (the previous build posted directly to a hardcoded
third-party URL).

## Verification run in this environment

```
pnpm install                        # from repo root
pnpm -r lint                        # 0 errors across packages/shared, apps/api, apps/web
pnpm -r build                       # passes (web: vite build; api/shared: no build step)
pnpm -r test                        # 18 tests passing (shared: 12, api: 6)
docker compose up --build           # db, mailpit, api, web all healthy
```

The real flows were exercised against the running containers with a
Chromium browser (Playwright): register, login/logout, role-aware UI for
both `ADMIN` and `TECHNICIAN`, create/edit/delete a device, log completed
maintenance, send a reminder email (confirmed delivered in Mailpit),
delete-conflict handling for staff/rooms, and client-side validation
errors.

## Bugs fixed (root cause, not papered over)

- **Delete crashed on the "all devices" list.** `AllItems.jsx` never passed
  a `deviceList` prop to `ItemCard`, so `deviceList.filter(...)` threw.
  There is no such prop-drilling anymore — device state lives in
  `useDeviceList`/`useDeviceInteractions` and every list gets a real,
  paginated response from `GET /api/devices`.
- **"Send Email" always claimed success, even on failure**, because
  `axios.post` was fired without `await` and the success alert ran
  unconditionally. The reminder button now `await`s
  `POST /api/devices/:id/notify` and shows success/error via a toast based
  on the actual result.
- **The delete-after-send-email code path referenced `isEmailSended`, a
  variable that was never declared anywhere** — every click silently threw
  and was swallowed by an empty-ish `catch`. That auto-delete-after-email
  behavior was removed outright rather than "fixed": deleting a device
  because a reminder was sent isn't a real product behavior, it was an
  accidental side effect of a bug, and it's unrelated to what the button
  is for.
- **`if ((typ, id, location))` used the comma operator**, so the "guard"
  only ever evaluated `location` — silently doing nothing useful. There is
  no such guard needed now: the payload is validated with
  `@wartungstermine/shared`'s zod schemas before it's ever sent.
- **Deleting a staff member/room who still owns a device white-screened
  the dashboard** (`personalList.filter(...)[0].name` with no bounds/optional
  chaining check). The API now returns `409 Conflict` with an actionable
  message in that case (see `apps/api/src/modules/{staff,rooms}/*.service.js`),
  and the web app surfaces it as a toast, not a crash — proven with an
  automated test that deletes a staff member who still owns a device and
  asserts the page is still intact.
- **`NotFoundPage` rendered the literal string `"NotFoundPage"`.** It's now
  a real 404 page with a link back to the dashboard.
- **English/German were mixed on the same screen** ("Alle Geräte",
  "Wartungstermine Verwalten", "Gerätebesitzer", "Wartungsperiode" next to
  "Add New Device"). The UI is English-only now. The shipped typos/broken
  English (`sucessfully`, `successfuly`, `Departmant`, `technicerEmail`)
  don't exist anymore either — this was a full rewrite against the real
  API, not a find-and-replace over the old strings.
- **`pnpm --filter wartungstermine lint` reported 508 problems.** The
  rebuilt frontend lints clean (0 errors). The one remaining item is a
  `react-refresh/only-export-components` **warning** (doesn't fail the
  build); `react/prop-types` is intentionally disabled project-wide (see
  `apps/web/eslint.config.js`) because this is a plain-JS project with no
  PropTypes/TypeScript, and request/response shapes are already validated
  once, centrally, by the shared zod schemas and the API's own validation
  middleware — adding PropTypes on top would be a second, redundant,
  easily-drifting type system for the same data.

## Design decisions

- **Palette & contrast.** All text/background pairings meet WCAG AA
  (≥4.5:1 for body text). Tokens are documented in
  `apps/web/src/assets/css/tokens.css` with the contrast ratio noted next
  to each color.
- **Status is never color-only.** Overdue/due-soon/OK is a chip with an
  icon, a text label ("Overdue"/"Due soon"/"OK"), and that label is what's
  exposed to assistive tech — not just a colored dot. See
  `apps/web/src/components/StatusBadge.jsx`.
- **Type scale & spacing** are small, fixed sets of CSS custom properties
  (`--font-size-*`, `--space-*`) rather than ad hoc values per component.
- **Loading/empty/error states** are explicit everywhere data is fetched:
  skeleton cards while loading, a dedicated empty state when a list is
  genuinely empty, and a retryable error banner (not a blank screen) when a
  request fails.
- **Accessible modals** use the native `<dialog>` element
  (`ConfirmDialog`, `DeviceDetailModal`) instead of a hand-rolled focus
  trap: it gets Escape-to-close, a backdrop, and focus containment from the
  browser for free. A confirmation dialog always closes itself once the
  action settles — including on failure — so a rejected delete (e.g. a 409
  conflict) can't leave a modal stuck open, blocking the rest of the page
  (a real bug caught by automated testing during this work, since fixed).
- **Focus states** are a visible 3px outline on every interactive element
  (`:focus-visible` in `tokens.css`), not suppressed anywhere.
- **Responsive.** The sidebar nav becomes a wrapping top bar under 768px;
  device grids and two-column layouts collapse to a single column; data
  tables (staff/rooms) switch to a stacked "label: value" card layout on
  narrow viewports instead of scrolling horizontally.
- **Client-side validation reuses the server's schemas.** Forms call
  `createDeviceSchema`/`createStaffSchema`/etc. from `@wartungstermine/shared`
  directly (`safeParse`) instead of re-deriving validation rules, so the
  client and the API can never drift on what "valid" means.

## Known limitations / open items

- **No "list all technicians" endpoint exists on the API** — a device's
  `technician` is only ever exposed nested on that device's own record
  (see `apps/api/src/modules/devices/devices.repository.js`'s
  `DEVICE_INCLUDE`). The device create/edit form's technician dropdown is
  therefore derived client-side from technicians already seen across the
  currently loaded devices, plus the signed-in user if they're a
  technician (`apps/web/src/utils/deriveTechnicianOptions.js`). This is a
  working default for the seeded data, but a brand-new technician who
  isn't yet assigned to any device won't appear in the dropdown until they
  are. The clean fix is a small, admin-only `GET /api/users?role=TECHNICIAN`
  endpoint on the API — intentionally not added here since it's outside
  this task's scope (frontend-only).
- **Third-party asset removed.** The old `index.html` loaded its favicon
  from a GitHub-hosted PNG of a real company's logo (`ScooTeq Gmbh.png`),
  hotlinked from a personal repo with no clear license. It's been replaced
  with a small inline SVG icon authored for this project (no external
  request, no third-party mark). No other logos or stock imagery were
  found under `apps/web/src`.
- The manual "run the full notification sweep now" endpoint
  (`POST /api/notifications/run`) has no dedicated admin UI yet; the
  per-device "Send reminder" button (`POST /api/devices/:id/notify`) covers
  the demoable path.
