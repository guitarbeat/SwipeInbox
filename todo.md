# TODO

## Setup & Env
- [ ] Create `.env` with `DATABASE_URL` (Neon), and ensure it’s not committed
- [ ] Add npm script for seeding: `"db:seed": "tsx server/seed.ts"`
- [ ] Document local dev and prod steps in `README.md`

## Database & Migrations (Drizzle)
- [ ] Generate initial migrations for `emails`, `stats`, `activities` and push (`drizzle-kit push`)
- [ ] Add indexes: `emails.status`, `emails.timestamp`
- [ ] Add unique index on `emails.external_id` to avoid IMAP duplicates
- [ ] Extend `stats` with `deleted` count and migrate data

## Backend API (Express)
- [ ] Validate `PATCH /api/emails/:id/status` with allowed statuses (`inbox|later|archived|deleted`) via Zod
- [ ] Add pagination to `GET /api/emails` and `GET /api/emails/status/:status` (`limit`, `offset`)
- [ ] Add search/filter endpoint (by sender, subject, date range)
- [ ] Fix prod static path mismatch: make `serveStatic` serve from root `dist/public` or change Vite outDir to `server/public`
- [ ] Implement auth (passport-local + express-session + connect-pg-simple); protect `/api/*`
- [ ] Rate-limit IMAP endpoints (`/api/email/test`, `/api/email/fetch`)
- [ ] Add OpenAPI/route docs for all endpoints

## Storage Layer (Drizzle operations)
- [ ] Order by `desc(emails.timestamp)` instead of fetching then reversing in `getAllEmails`
- [ ] When deleting, increment `stats.deleted` rather than `stats.archived`
- [ ] Record `activities.action = "deleted"` on delete
- [ ] Wrap multi-step updates (status change + stats + activities) in a transaction

## Email Service (IMAP)
- [ ] Parse and persist `senderEmail` in `toInsertEmail` (currently empty string)
- [ ] Derive `attachments` count and `hasReply` when available
- [ ] Optional: endpoint to mark IMAP message as read and/or move to folder after processing

## Frontend (React + Wouter + React Query)
- [ ] Create pages: `pages/home.tsx`, `pages/settings.tsx`, `pages/not-found.tsx`
- [ ] Build core components: `CardStack`, `EmailCard`, `SwipeOverlay`, `ActionButtons`, `StatsGrid`, `ActivitiesList`
- [ ] Wire React Query hooks to backend: list inbox/later/archived, update status, delete, undo, stats, activities
- [ ] Settings page: provider select, email/password form; call `/api/email/providers`, `/api/email/test`, `/api/email/fetch`; show results/toasts
- [ ] Add loading, empty, and error states; toasts via `@/components/ui/toaster`
- [ ] Theme support using `ThemeProvider`; add theme toggle in header

## Build & Deploy
- [ ] Ensure `npm run build` outputs client to `dist/public` and server to `dist/index.js`; verify `npm start` serves app
- [ ] Add basic healthcheck endpoint and production logging
- [ ] Optional: Add Dockerfile and CI workflow

## Testing & QA
- [ ] Add API tests with Vitest + Supertest for routes
- [ ] Add unit tests for storage functions (Drizzle) using a test DB
- [ ] Add e2e happy-path test covering swipe/archive/delete flows