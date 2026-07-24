# AGENT.md

Guidance for AI coding agents working in this repo. See [README.md](README.md) for human-facing setup instructions.

## Architecture

Single Next.js 15 App Router app — not a monorepo, not two deployable services. `app/` (routing) and `public/` (static assets) must stay at the project root because Next.js requires it. Everything else is split by concern:

- `backend/` — server-only code, never imported by client components
  - `db.js` — the shared `pg` `Pool` singleton (`export default pool`)
  - `auth.js` — `getUser(request)`, `requireAuth(request)`, `requireAdmin(request)` — JWT verification against `process.env.JWT_SECRET`
  - `rateLimit.js` — in-memory sliding-window limiter (`getClientKey`/`isRateLimited`/`recordFailedAttempt`/`clearAttempts`), used by `/api/auth/login` to block an IP after 5 failed attempts in 15 minutes. State lives in a module-level `Map`, so it resets on every server restart — fine for this app's traffic, wouldn't scale past a single process.
  - `schema.sql` — the only source of truth for Postgres table shape; there is no ORM
  - `scripts/create-user.js` — run with `node backend/scripts/create-user.js <username> <password> [admin|staff]`
- `frontend/` — client-only code (everything here assumes it runs in the browser)
  - `lib/api-client.js` — the only place `fetch('/api/...')` should be called from pages; every resource has a `xApi` object (`residentsApi`, `executivesApi`, etc.) with `list/create/update/remove` methods
  - `lib/useInView.js` / `lib/useCountUp.js` — animation hooks (IntersectionObserver-based reveal, and a `requestAnimationFrame` count-up), used by the homepage
  - `context/` — `AuthContext.jsx`/`auth-context.js`/`useAuth.js` (auth) and `ThemeContext.jsx`/`theme-context.js`/`useTheme.js` (light/dark mode) — each kept as three files (provider, raw context, hook) on purpose, don't collapse them
  - `components/` — `Navbar.jsx` (nav items + visibility rules live in its `NAV_ITEMS` array), `ThemeToggle.jsx` (sun/moon switch, lives in the navbar), `LoginForm.jsx` (rendered inline by pages that require auth, not routed to directly)
  - `components/ui/` — the shared design-system primitives (see Styling below)
  - `styles/globals.css` — Tailwind v4 entrypoint: `@import "tailwindcss"`, the `@custom-variant dark` definition, custom `@theme` animations (`blob`, `float`, `fade-in-up`), and the base layer
- `app/api/**/route.js` — one file per REST resource, following a consistent shape: a private `toX(row)` mapper (snake_case DB row → camelCase JSON), `requireAuth`/`requireAdmin` guard at the top of handlers that need it, `pool.query` with parameterized `$1, $2, ...`

Path alias: `@/*` → project root (`jsconfig.json`), so imports are `@/backend/db`, `@/frontend/lib/api-client`, etc.

## Styling

Every page uses Tailwind v4 utility classes (CSS-first config, no `tailwind.config.js` — theme customization lives in `frontend/styles/globals.css`'s `@theme` block) plus a small shared design system in `frontend/components/ui/`:

- `Button.jsx` — variants `primary` (indigo), `secondary` (slate), `accent` (teal, used for in-card "Edit" actions), `success` (emerald, used for the payment confirm action), `danger` (red). Also exports `buttonClasses(variant, className)` for cases that need button styling on a non-`<button>` element (e.g. a `next/link` styled as a CTA) — see the hero in `app/page.jsx`.
- `Card.jsx` — the standard white/slate-900 rounded surface used for every panel and list item; forwards `ref` (needed for `useInView`).
- `Input.jsx` / `Select.jsx` / `Textarea.jsx` — form controls sharing `fieldStyles.js`'s `fieldClass` (and `labelClass` for the rare page that renders its own `<label>`).
- `Badge.jsx` — colored status pills (resident type, user role, executive status, etc.).
- `Reveal.jsx` — wraps children in a scroll-triggered fade/slide-up (via `useInView`); used for hero text staggering and card-grid entrances across every page. It only animates once actually scrolled into view — a full-page screenshot taken without scrolling will show these sections as empty; that's expected, not a bug.

Adding a new page or card should compose these primitives rather than writing new inline styles or new one-off Tailwind color choices — see [.claude/skills/add-crud-resource/SKILL.md](.claude/skills/add-crud-resource/SKILL.md) for the full pattern.

Dark mode is class-based (`@custom-variant dark (&:where(.dark, .dark *));`), toggled by `frontend/context/ThemeContext.jsx` and persisted to `localStorage` (`happyland_theme`). `app/layout.jsx` has an inline `<script>` (not `next/script`) that sets the `dark` class on `<html>` synchronously before hydration — this is required to avoid a flash of the wrong theme, don't remove it or defer it. Every new component needs both a light and a `dark:` styling — there is no default that silently works for both.

## Auth pattern

Two roles, both on the `users.role` column: `admin` (full access, including managing other accounts via `/api/users`) and `staff` (can manage Residents & Executives, cannot manage accounts). There is no third tier — a new permission boundary means a new role value plus a new `requireX` guard in `backend/auth.js`, not an ad-hoc check scattered in a route handler.

- Login: `POST /api/auth/login` → rate-limited via `backend/rateLimit.js` (5 failed attempts per IP per 15 min → `429`), then bcrypt-compares against `users.password_hash`, signs a JWT with `{ sub, username, role }`, 12h expiry
- Client stores the token via `frontend/lib/api-client.js`'s `setToken`/`getToken`/`clearToken` (`localStorage` key `happyland_token`) and the user object via `AuthContext` (`localStorage` key `happyland_user`)
- Every authenticated request goes through `frontend/lib/api-client.js`'s `request()`, which attaches `Authorization: Bearer <token>` automatically
- Server-side: call `requireAuth(request)` for "any signed-in user" or `requireAdmin(request)` for "admin only" as the first line of a route handler; both return `{ user, error }` — return `error` immediately if present
- Client-side gating mirrors this: `useAuth()`'s `user.role` drives `adminOnly`/`restricted` flags in `Navbar.jsx`'s `NAV_ITEMS`, and pages that need the admin tier check `currentUser.role !== 'admin'` directly (see `app/users/page.jsx`)

## Commands

- `npm run dev` — dev server on :3000
- `npm run build` — production build (also runs ESLint + type checking)
- `npm run lint` — ESLint only
- `psql -d happyland_estate -f backend/schema.sql` — (re)load schema
- `node backend/scripts/create-user.js <username> <password> [admin|staff]` — create/update a login

## Environment

Copy `.env.local.example` → `.env.local`. Required: `PGHOST`/`PGPORT`/`PGUSER`/`PGPASSWORD`/`PGDATABASE`, `JWT_SECRET`.

Postgres itself runs locally as a Windows service (`postgresql-x64-18`); `psql` is not on PATH by default, use the full path under `C:\Program Files\PostgreSQL\18\bin\` if needed. If the app can't reach the database, check that this service is running (`Get-Service postgresql*` in PowerShell) before assuming anything else is wrong.

## Verifying a change

Always run `npm run build` before considering a change done — it catches both compile errors and ESLint issues (`next lint` rules run as part of build). There's no test suite; manual verification via `npm run dev` is the only other check available.

## Deployment (Hostinger)

Production runs on Hostinger's Node.js app hosting (hPanel), pointed at the Supabase Postgres project via `PGHOST=aws-0-eu-west-1.pooler.supabase.com` (session pooler, port 5432, user `postgres.ppdvgtncowodlmkrxxpi`) — never the direct `db.<ref>.supabase.co` host, which is IPv6-only and unreachable from Hostinger. `JWT_SECRET` and all `PG*` vars are set directly in hPanel's environment variable UI, not committed anywhere.

This setup has caused multiple real outages, always with the same symptom: the homepage still loads (served from a stale Next.js/CDN cache — check for `x-nextjs-cache: HIT` and a large `Age` header to confirm), while every other route, including login, returns `503`. Root causes so far:

1. **Rebuilding while the app is still running** corrupts `.next` (old and new chunks coexist, causing `Cannot find module './NNN.js'` errors) — always **stop the app, then build, then start it**, never rebuild live.
2. **Environment variables reset or mistyped** between deploys (e.g. `PGUSER`/`PGDATABASE` swapped) — if the site is up but every DB-backed request fails, re-verify the env vars against the values above before looking anywhere else.
3. **A risky server-startup hook** (an earlier `instrumentation.js` that called `sharp.block()` unconditionally) was suspected of crashing the process on Hostinger's platform-specific `sharp` build; it was reverted along with a `postcss`/`sharp` dependency bump rather than root-caused, so those two `npm audit` findings are currently unresolved again — re-apply carefully (test the built app actually boots, don't add unguarded native-module calls to `instrumentation.js`) rather than blindly redoing the same commits.

When the site is down: check hPanel's **runtime log** (not the build log) first — an empty runtime log means the process never started (check the build log instead, and confirm the app shows "Running"); a runtime log with a stack trace tells you exactly what crashed.
