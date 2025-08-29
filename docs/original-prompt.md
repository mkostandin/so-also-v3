You are my project migrator and implementer. You’re working inside a monorepo with:

Frontend: ui/ (React + Vite + Tailwind + ShadCN)
Backend: server/ (Hono on Cloudflare Workers), PostgreSQL (Drizzle), Firebase Admin for auth verification
Local dev: embedded Postgres + Firebase emulator via `pnpm dev`
Deploy: Cloudflare Pages (UI) + Workers (API)
PWA scope MUST be /app/* only (non-PWA landing at root).

You will implement the “So Also” app end-to-end with production-ready code (TS/TSX/SQL), migrations, config, and acceptance checks. Generate COMPLETE files (no “…”), runnable on the free tier.

In addition to the main spec below, **incorporate the following prior plans and review items** that have already been done / partially done so we don’t regress:
- Recurrence library & materializer job structure and functions; job runner; cron wiring; UI components list; validation/util libs; production config files and PWA optimizations. (source: Remaining Features plan)
- Conference UI system & routes; enhanced embed features; interactive map integration plan and utilities. (source: Remaining UI plan)
- CRITICAL fixes from code review: nested routing (not conditional rendering) under /app/map; ListView EventItem must include latitude/longitude; remove mock data and wire real API; add missing location-filter params to /browse; fix a11y error in LocationPermissionBanner; move inline styles to Tailwind classes; fill missing components (LocationSelector, useLocationPreferences, geolocation utils, CalendarEventIndicator, ConferenceCalendar). (source: Code Review)

=== 0) Global setup (PWA + routes) ===
- PWA only controls /app/*.
- Create `ui/public/app/manifest.json`, `ui/public/app/sw.js`, `ui/public/app/icons/icon-192.png`, `ui/public/app/icons/icon-512.png`.
- Register SW in the UI with scope "/app/".
- Add bottom tab bar that appears on `/app/*` routes (Map, Submit, Conferences, Settings).
- Root landing (non-PWA): `ui/src/routes/Landing.tsx` with CTA button to `/app/`.
- Lightweight `/embed` route (outside PWA) for Squarespace iframes, no SW registration.

Routing files to create/update:
- `ui/src/main.tsx` (or App.tsx) – React Router with `/` → Landing; `/embed`; `/app/*`
- `ui/src/components/BottomTabs.tsx`
- `ui/src/routes/MapIndex.tsx` (parent that renders nested child routes via <Outlet/> & segmented control that navigates)
- `ui/src/routes/MapView.tsx`, `ui/src/routes/ListView.tsx`, `ui/src/routes/CalendarView.tsx`
- `ui/src/routes/EventDetail.tsx`, `ui/src/routes/SubmitEvent.tsx`
- `ui/src/routes/Conferences.tsx`, `ui/src/routes/ConferenceDetail.tsx`
- `ui/src/routes/Settings.tsx`, `ui/src/routes/EmbedView.tsx`
- `ui/src/styles.css` or Tailwind classes for cards + segmented control

**Routing RULES**
- Use **nested routing** under `/app/map`:
  - `/app/map` → Map (default)
  - `/app/map/list` → List
  - `/app/map/calendar` → Calendar
- `MapIndex` must NOT use conditional rendering; it must render an `<Outlet />` so browser back/forward works. Fix the prior bug.
- BottomTabs visible on all `/app/*` routes.

=== 1) Data model (Drizzle) ===
Create schema files in `server/src/schema/` and a central index export. Tables:

events (one-off events):
- id uuid pk, name, event_type ('Event'|'Committee Meeting'|'Conference'|'YPAA Meeting'|'Other'), committee, committee_slug,
  description, address, city, state_prov, country, postal,
  coords: latitude numeric, longitude numeric,
  flyer_url, website_url, contact_email (private), contact_phone (private),
  status ('pending'|'approved'|'rejected'),
  starts_at_utc timestamptz, ends_at_utc timestamptz,
  created_at, updated_at
- indexes: (status, ends_at_utc asc), (committee_slug, status, ends_at_utc asc)

series (recurring templates for Committee Meeting, YPAA Meeting):
- id uuid pk, name, type ('Committee Meeting'|'YPAA Meeting'),
  committee, committee_slug, timezone, start_time_local text (HH:mm),
  duration_mins int,
  rrule JSON {freq:'weekly'|'monthly', interval int, by_weekday string[] of SU..SA, by_set_pos int[], by_month int[], until date|null, count int|null},
  ex_dates date[], overrides JSON (keyed by local date),
  address, city, state_prov, country, postal, coords, status, notify_topic, created_at, updated_at

occurrences (materialized from series):
- id uuid pk, series_id fk, name, type, committee, committee_slug,
  starts_at_local text ISO local, ends_at_local text ISO local,
  starts_at_utc timestamptz, ends_at_utc timestamptz,
  address/city/state_prov/country/postal snapshot, coords, status, notify_topic
- indexes: (status, ends_at_utc asc)

conferences:
- id uuid pk, name, city, program_url, hotel_map_url, flyer_url, starts_at_utc, ends_at_utc, status, created_at, updated_at

conference_sessions:
- id uuid pk, conference_id fk, title, type ('workshop'|'panel'|'main'|'marathon'),
  room, desc, starts_at_utc, ends_at_utc, status
- index: (conference_id, starts_at_utc asc)

flags (user reports):
- id uuid pk, target_type ('event'|'conference'|'session'|'series'), target_id (text/uuid),
  committee_slug nullable, reason enum ('incorrect_time'|'wrong_address'|'broken_link'|'duplicate'|'not_ypaa'|'inappropriate'|'other'),
  message text, contact_email nullable, status ('open'|'resolved'|'dismissed'), created_at, created_by nullable (uid/string), device_id nullable

ratelimits:
- key text pk, count int, reset_at timestamptz

Generate migrations; ensure `cd server && pnpm db:push` works against embedded Postgres.

=== 2) Auth middleware (server) ===
File: `server/src/middleware/auth.ts`
- Implement Firebase Admin ID token verification.
- Local dev: accept emulator tokens; Prod: verify via Admin SDK.
- Export `getUserOrNull(c)`, `requireUser(c)` which sets `c.set('user', user)`.

=== 3) API (Hono) – `server/src/index.ts` ===
CORS: allow Pages origin in dev/prod.

**Public GET (no auth):**
- `GET /api/v1/events?committee=:slug&range=:days` → approved one-offs where `ends_at_utc >= now`. Optional committee filter. Sensible limit (e.g., 500).
- `GET /api/v1/occurrences?committee=:slug&range=:days` → approved occurrences, same filter.
- `GET /api/v1/browse?committee&range&lat&lng&radius` → merged array of events + occurrences, sorted by `starts_at_utc` asc. If lat/lng/radius present, filter by distance (Haversine) server-side and include computed distanceMeters in payload.
- `GET /api/v1/conferences` → approved & upcoming window.
- `GET /api/v1/conferences/:id`
- `GET /api/v1/conferences/:id/sessions`

**Submit (public; pending status):**
- `POST /api/v1/events` → create pending event (sanitize; `status='pending'`). Accept optional flyer_url; include private contact fields.

**Flags (public):**
- `POST /api/v1/flags` → create a flag with anti-abuse (see §6).

**Admin/Mod (protected):**
- `POST /api/v1/series` → create recurring series
- `POST /api/v1/series/:id/generate` → materialize next N months into `occurrences`
- Approve/reject PATCH endpoints for events/occurrences/sessions (simple status updates)

Validation: Use zod (or valibot) for payloads; always return **camelCase**.

**Fixes to apply from review:**
- Implement the location-filtered `/browse` params.
- Replace any mock conference/session data with real DB queries.
- Ensure `EventItem` shape in UI matches API (must include `latitude`, `longitude` if present).

=== 4) Recurrence generation (server) ===
Files:
- `server/src/lib/recurrence.ts` – implement:
  - nth-weekday monthly calc (by_set_pos + by_weekday)
  - weekly generation using interval + allowed weekdays
  - `generateInstancesForMonths(series, monthsAhead)` returning {startsAtLocal, endsAtLocal, startsAtUtc, endsAtUtc} honoring series timezone + start_time_local (DST safe).
- Use `luxon` or `@js-temporal/polyfill` for TZ conversions.
- `server/src/jobs/materializeSeries.ts`: given a series row + monthsAhead (e.g., 6–9), generate & **upsert** into `occurrences`.
- Add scheduled Worker CRON in `server/wrangler.toml` to run daily; keep rolling window. Local dev manual route: `POST /api/v1/dev/run-materializer`.

=== 5) UI (tabs, views, detail) ===
- Bottom nav order/labels: Map, Submit, Conferences, Settings.
- Map tab contains segmented control with three child routes (Map/List/Calendar).
- `EventDetail` at `/app/e/:slugOrId` with Back: if history length > 1 use `navigate(-1)` else `navigate('/app/map')`.
- Everywhere: auto-hide past items (`ends_at_utc >= now`).
- `/embed` (outside PWA) reads query params `committee`, `view=(map|list|calendar)`, `range=Xd`, and calls public browse APIs. No SW.
- **Implement and use real API calls for conferences** (no mock data).

**Components/Utils to include/fix (per review & plans):**
- `ui/src/components/FlagButton.tsx` modal (reason, optional message ≤500, optional email; honeypot; deviceId from localStorage; POST /api/v1/flags)
- `ui/src/components/NearbyEventsToggle.tsx`
- `ui/src/components/LocationPermissionBanner.tsx` (FIX a11y: buttons have accessible text / title)
- `ui/src/hooks/useUserLocation.ts`
- `ui/src/lib/location-utils.ts` (haversine, etc.)
- `ui/src/lib/map-utils.ts` (marker helpers, clustering stubs)
- `ui/src/components/LocationSelector.tsx` (manual location fallback)
- `ui/src/hooks/useLocationPreferences.ts`
- `ui/src/lib/geolocation.ts` (enhanced utilities, distinct from map-utils)
- `ui/src/components/CalendarGrid.tsx`, `EventTimeSlot.tsx`, `CalendarNavigation.tsx`, `CalendarEventIndicator.tsx`
- `ui/src/components/ConferenceCard.tsx`, `SessionCard.tsx`, `ConferenceTabs.tsx`, `ProgramSchedule.tsx`, `HotelMapViewer.tsx`, `ConferenceCalendar.tsx`

**Styling cleanup:** remove inline styles flagged in review; prefer Tailwind classes.

**Data shape alignment:** Ensure `EventItem` includes `latitude?: number; longitude?: number;` to match API; update any references accordingly.

=== 6) “Report an issue” flow (flags) ===
Backend:
- `ratelimits` gate: max 3 flags per `device_id` per 24h (txn-safe).
- If honeypot filled, accept request but no-op (silent drop).
- Create with `status='open'`, `created_at=now()`, optional `created_by` from auth, optional `SLACK_WEBHOOK_URL` notification.
UI:
- `FlagButton` on Event/Occurrence/Conference/Session detail screens posts to `/api/v1/flags`.

=== 7) Notifications (stubs) ===
- On Settings and ConferenceDetail/Notify tab: localStorage topic toggles only.
- Prepare TypeScript interfaces for future FCM token storage / topic subscribe.

=== 8) Embeds (Squarespace) ===
- `/embed` renders read-only map/list/calendar using public browse API, accepts `committee`, `view`, `range`.
- Safe styles for iframes; **no service worker** here.

=== 9) Netlify/Cloudflare & env ===
- Keep PWA scope at `/app/`; Pages/Workers must serve `ui/public/app/*`.
- SPA fallback (Pages): `ui/dist` with fallback to `index.html`.
- Worker env (`server/wrangler.toml`): `DATABASE_URL`, `FIREBASE_PROJECT_ID`, optional `SLACK_WEBHOOK_URL`. Add CRON for series materializer.
- Pages env: optional `VITE_API_URL` if worker URL is non-standard.

=== 10) UX specifics (match previous app) ===
- Bottom nav: Map, Submit, Conferences, Settings.
- Map tab segmented control navigates nested routes.
- Event flyer optional.
- Sharing: Web Share API with copy link fallback.
- Deep links: `/app/e/:id` should open app page correctly.
- Moderation tooling is out of scope for PWA (future `/admin`).

=== 11) Acceptance checks ===
`pnpm dev` spins UI + API + embedded Postgres + Firebase emulator.
I can:
- Submit a new event → appears `pending` (NOT in public lists).
- Approve an event (temp admin endpoint or direct DB) → appears in List/Calendar and hides after end time.
- Create a series via API, run materializer → occurrences appear.
- Toggle location filter in ListView; when enabled and browser permissions granted, events are sorted by distance; with `lat/lng/radius` on `/browse`, results filter server-side.
- Conference pages fetch real data (no mocks) and sessions load per conference.

=== 12) Dev ergonomics & linting ===
- Add Zod schemas for all write endpoints.
- Add minimal Jest/Vitest tests for recurrence edge cases (DST boundaries) and location utils (haversine).
- Fix the a11y error (button text) in LocationPermissionBanner.
- Ensure type-safe API client in `ui/src/lib/api-client.ts`.
- No inline styles in files flagged by review; use Tailwind utilities.

Now implement all of the above in the exact paths specified. Overwrite/replace placeholders as needed. Provide all new/changed files in full.