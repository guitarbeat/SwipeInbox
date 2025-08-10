# TODO

## Setup & Env
- [x] Add npm script for seeding: `"db:seed": "tsx server/seed.ts"`
- [ ] Document local dev and prod steps in `README.md`

## Backend API (Express)
- [x] Validate `PATCH /api/emails/:id/status` with allowed statuses (`inbox|later|archived|deleted`) via Zod
- [x] Add pagination to `GET /api/emails` and `GET /api/emails/status/:status` (`limit`, `offset`)
- [x] Add search/filter endpoint (by sender, subject, date range)
- [x] Fix prod static path mismatch: make `serveStatic` serve from root `dist/public` or change Vite outDir to `server/public`
- [x] Rate-limit IMAP endpoints (`/api/email/test`, `/api/email/fetch`)
- [ ] Add OpenAPI/route docs for all endpoints
- [x] Add healthcheck endpoint

## Storage Layer (Drizzle operations)
- [x] Order by `desc(emails.timestamp)` instead of fetching then reversing in `getAllEmails`
- [x] Record `activities.action = "deleted"` on delete
- [x] Wrap multi-step updates (status change + stats + activities) in a transaction

## Email Service (IMAP)
- [x] Parse and persist `senderEmail` in `toInsertEmail` (now extracted)
- [x] Derive `attachments` count and `hasReply` when available
- [ ] Optional: endpoint to mark IMAP message as read and/or move to folder after processing

## Frontend (React + Wouter + React Query)
- [ ] Create pages: `pages/home.tsx`, `pages/settings.tsx`, `pages/not-found.tsx`
- [ ] Build core components: `CardStack`, `EmailCard`, `SwipeOverlay`, `ActionButtons`, `StatsGrid`, `ActivitiesList`
- [ ] Wire React Query hooks to backend: list inbox/later/archived, update status, delete, undo, stats, activities
- [ ] Settings page: provider select, email/password form; call `/api/email/providers`, `/api/email/test`, `/api/email/fetch`; show results/toasts
- [ ] Add loading, empty, and error states; toasts via `@/components/ui/toaster`
- [ ] Theme support using `ThemeProvider`; add theme toggle in header

## Build & Deploy
- [x] Ensure `npm run build` outputs client to `dist/public` and server to `dist/index.js`; verify `npm start` serves app
- [ ] Add production logging

## Testing & QA
- [ ] Add API tests with Vitest + Supertest for routes (mock storage/db)