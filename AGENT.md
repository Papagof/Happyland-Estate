# AGENT.md

Guidance for AI coding agents working in this repo. See [README.md](README.md) for human-facing setup instructions.

## Architecture

Single Next.js 15 App Router app — not a monorepo, not two deployable services. `app/` (routing) and `public/` (static assets) must stay at the project root because Next.js requires it. Everything else is split by concern:

- `backend/` — server-only code, never imported by client components
  - `db.js` — the shared `pg` `Pool` singleton (`export default pool`)
  - `auth.js` — `getUser(request)`, `requireAuth(request)`, `requireAdmin(request)` — JWT verification against `process.env.JWT_SECRET`
  - `supabase.js` — `createSupabaseClient()` / `createSupabaseAdminClient()`, **not called anywhere yet**. The app's real data layer is still `db.js` + `auth.js`. Don't assume Supabase is live without checking.
  - `schema.sql` — the only source of truth for table shape; there is no ORM
  - `scripts/create-user.js` — run with `node backend/scripts/create-user.js <username> <password> [admin|authorized]`
  - `supabase/` — local Supabase CLI config from `supabase init` (no Docker on this machine, so no live local stack — CLI use is limited to project linking/migrations against a remote project)
- `frontend/` — client-only code (everything here assumes it runs in the browser)
  - `lib/api-client.js` — the only place `fetch('/api/...')` should be called from pages; every resource has a `xApi` object (`residentsApi`, `executivesApi`, etc.) with `list/create/update/remove` methods
  - `context/` — `AuthContext.jsx` (provider, holds `user` in `localStorage` under `happyland_user`), `auth-context.js` (the raw `createContext`), `useAuth.js` (the hook) — kept as three files on purpose, don't collapse them
  - `components/` — `Navbar.jsx` (nav items + visibility rules live in its `NAV_ITEMS` array) and `LoginForm.jsx` (rendered inline by pages that require auth, not routed to directly)
  - `styles/globals.css` — starts with `@import "tailwindcss";`, then the app's CSS custom properties and a minimal reset
- `app/api/**/route.js` — one file per REST resource, following a consistent shape: a private `toX(row)` mapper (snake_case DB row → camelCase JSON), `requireAuth`/`requireAdmin` guard at the top of handlers that need it, `pool.query` with parameterized `$1, $2, ...`

Path alias: `@/*` → project root (`jsconfig.json`), so imports are `@/backend/db`, `@/frontend/lib/api-client`, etc.

## Styling

Every existing page/component uses inline `style={{...}}` objects — this is the current convention, not an oversight. Tailwind CSS v4 is installed and wired into `frontend/styles/globals.css` (CSS-first config, no `tailwind.config.js`) but has **not** been applied to any existing markup. New work may use Tailwind utility classes; don't silently convert existing inline styles to Tailwind as a drive-by change.

Tailwind v4's Preflight base reset is active, which changes default browser styling for unstyled elements (`button`, `input`, `select`, etc.). Existing components mostly set these explicitly via inline styles, so this is expected to be inert, but if you see an unstyled-looking form control, check whether it's missing an inline style rather than assuming Tailwind broke something.

## Auth pattern

- Login: `POST /api/auth/login` → bcrypt-compares against `users.password_hash`, signs a JWT with `{ sub, username, role }`, 12h expiry
- Client stores the token via `frontend/lib/api-client.js`'s `setToken`/`getToken`/`clearToken` (`localStorage` key `happyland_token`) and the user object via `AuthContext` (`localStorage` key `happyland_user`)
- Every authenticated request goes through `frontend/lib/api-client.js`'s `request()`, which attaches `Authorization: Bearer <token>` automatically
- Server-side: call `requireAuth(request)` or `requireAdmin(request)` as the first line of a route handler; both return `{ user, error }` — return `error` immediately if present

## Commands

- `npm run dev` — dev server on :3000
- `npm run build` — production build (also runs ESLint + type checking)
- `npm run lint` — ESLint only
- `psql -d happyland_estate -f backend/schema.sql` — (re)load schema
- `node backend/scripts/create-user.js <username> <password> [admin|authorized]` — create/update a login

## Environment

Copy `.env.local.example` → `.env.local`. Required: `PGHOST`/`PGPORT`/`PGUSER`/`PGPASSWORD`/`PGDATABASE`, `JWT_SECRET`. The `NEXT_PUBLIC_SUPABASE_*` / `SUPABASE_SERVICE_ROLE_KEY` vars are optional placeholders for the unused `backend/supabase.js` client — leaving them blank is fine.

Postgres itself runs locally as a Windows service (`postgresql-x64-18`); `psql` is not on PATH by default, use the full path under `C:\Program Files\PostgreSQL\18\bin\` if needed.

## Verifying a change

Always run `npm run build` before considering a change done — it catches both compile errors and ESLint issues (`next lint` rules run as part of build). There's no test suite; manual verification via `npm run dev` is the only other check available.
