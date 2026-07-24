# AGENT.md

Guidance for AI coding agents working in this repo. See [README.md](README.md) for human-facing setup instructions.

## Architecture

Single Next.js 15 App Router app — not a monorepo, not two deployable services. `app/` (routing) and `public/` (static assets) must stay at the project root because Next.js requires it. Everything else is split by concern:

- `backend/` — server-only code, never imported by client components
  - `db.ts` — the shared `pg` `Pool` singleton (`export default pool`)
  - `auth.ts` — `getUser(request)`, `requireAuth(request)`, `requireAdmin(request)` — JWT verification against `process.env.JWT_SECRET`
  - `schema.sql` — the only source of truth for Postgres table shape; there is no ORM
  - `scripts/create-user.ts` — run with `node backend/scripts/create-user.ts <username> <password> [admin|staff]`. Runs via Node's native TypeScript support, not a bundler — needs Node 22.6+ (stable/unflagged on 23.6+); this repo has been developed against Node 24.
- `frontend/` — client-only code (everything here assumes it runs in the browser)
  - `lib/api-client.ts` — the only place `fetch('/api/...')` should be called from pages; every resource has a `xApi` object (`residentsApi`, `executivesApi`, etc.) with `list/create/update/remove` methods
  - `lib/useInView.ts` / `lib/useCountUp.ts` — animation hooks (IntersectionObserver-based reveal, and a `requestAnimationFrame` count-up), used by the homepage
  - `context/` — `AuthContext.tsx`/`auth-context.ts`/`useAuth.ts` (auth) and `ThemeContext.tsx`/`theme-context.ts`/`useTheme.ts` (light/dark mode) — each kept as three files (provider, raw context, hook) on purpose, don't collapse them
  - `components/` — `Navbar.tsx` (nav items + visibility rules live in its `NAV_ITEMS` array), `ThemeToggle.tsx` (sun/moon switch, lives in the navbar), `LoginForm.tsx` (rendered inline by pages that require auth, not routed to directly)
  - `components/ui/` — the shared design-system primitives (see Styling below)
  - `styles/globals.css` — Tailwind v4 entrypoint: `@import "tailwindcss"`, the `@custom-variant dark` definition, custom `@theme` animations (`blob`, `float`, `fade-in-up`), and the base layer
- `app/api/**/route.ts` — one file per REST resource, following a consistent shape: a private `toX(row)` mapper (snake_case DB row → camelCase JSON), `requireAuth`/`requireAdmin` guard at the top of handlers that need it, `pool.query` with parameterized `$1, $2, ...`

Path alias: `@/*` → project root (`tsconfig.json`), so imports are `@/backend/db`, `@/frontend/lib/api-client`, etc.

## TypeScript

The whole app is `.ts`/`.tsx` (converted from plain JS). Typing is intentionally pragmatic, not strict — `tsconfig.json` has `"strict": false`, and there's no push to add exhaustive interfaces for every API payload or DB row. When adding new code:

- Prefer typing component props and function signatures where it's cheap (destructured props, hook return values), but don't fight React's string-only controlled-input values — a form-state object mixing numbers and strings (e.g. a numeric field edited via `<input type="number">`, whose `onChange` always delivers a string) is fine typed as `Record<string, any>` rather than a precise union.
- `global.d.ts` at the root declares `*.css` as an ambient module — needed because Next's own types don't cover plain (non-`.module.css`) side-effect CSS imports from a non-default path (`@/frontend/styles/globals.css`).
- `useInView<T extends HTMLElement>()` is generic so callers can type their own ref target (see `Reveal.tsx` using `useInView<HTMLDivElement>()`) instead of every call site needing a cast.
- `npm run build` runs the TypeScript checker as part of the Next.js build (same as it always ran ESLint) — a type error fails the build exactly like a lint error did before.

## Styling

Every page uses Tailwind v4 utility classes (CSS-first config, no `tailwind.config.js` — theme customization lives in `frontend/styles/globals.css`'s `@theme` block) plus a small shared design system in `frontend/components/ui/`:

- `Button.tsx` — variants `primary` (indigo), `secondary` (slate), `accent` (teal, used for in-card "Edit" actions), `success` (emerald, used for the payment confirm action), `danger` (red). Also exports `buttonClasses(variant, className)` for cases that need button styling on a non-`<button>` element (e.g. a `next/link` styled as a CTA) — see the hero in `app/page.tsx`.
- `Card.tsx` — the standard white/slate-900 rounded surface used for every panel and list item; forwards `ref` (needed for `useInView`).
- `Input.tsx` / `Select.tsx` / `Textarea.tsx` — form controls sharing `fieldStyles.ts`'s `fieldClass` (and `labelClass` for the rare page that renders its own `<label>`).
- `Badge.tsx` — colored status pills (resident type, user role, executive status, etc.).
- `Reveal.tsx` — wraps children in a scroll-triggered fade/slide-up (via `useInView`); used for hero text staggering and card-grid entrances across every page. It only animates once actually scrolled into view — a full-page screenshot taken without scrolling will show these sections as empty; that's expected, not a bug.

Adding a new page or card should compose these primitives rather than writing new inline styles or new one-off Tailwind color choices — see [.claude/skills/add-crud-resource/SKILL.md](.claude/skills/add-crud-resource/SKILL.md) for the full pattern.

Dark mode is class-based (`@custom-variant dark (&:where(.dark, .dark *));`), toggled by `frontend/context/ThemeContext.tsx` and persisted to `localStorage` (`happyland_theme`). `app/layout.tsx` has an inline `<script>` (not `next/script`) that sets the `dark` class on `<html>` synchronously before hydration — this is required to avoid a flash of the wrong theme, don't remove it or defer it. Every new component needs both a light and a `dark:` styling — there is no default that silently works for both.

## Auth pattern

Two roles, both on the `users.role` column: `admin` (full access, including managing other accounts via `/api/users`) and `staff` (can manage Residents & Executives, cannot manage accounts). There is no third tier — a new permission boundary means a new role value plus a new `requireX` guard in `backend/auth.ts`, not an ad-hoc check scattered in a route handler.

- Login: `POST /api/auth/login` → bcrypt-compares against `users.password_hash`, signs a JWT with `{ sub, username, role }`, 12h expiry
- Client stores the token via `frontend/lib/api-client.ts`'s `setToken`/`getToken`/`clearToken` (`localStorage` key `happyland_token`) and the user object via `AuthContext` (`localStorage` key `happyland_user`)
- Every authenticated request goes through `frontend/lib/api-client.ts`'s `request()`, which attaches `Authorization: Bearer <token>` automatically
- Server-side: call `requireAuth(request)` for "any signed-in user" or `requireAdmin(request)` for "admin only" as the first line of a route handler; both return `{ user, error }` — return `error` immediately if present
- Client-side gating mirrors this: `useAuth()`'s `user.role` drives `adminOnly`/`restricted` flags in `Navbar.tsx`'s `NAV_ITEMS`, and pages that need the admin tier check `currentUser.role !== 'admin'` directly (see `app/users/page.tsx`)
- Properties (`/properties`) and Management (`/executives`) are publicly viewable — GET endpoints and their "logged-out" page views have no auth check — but writes (`POST`/`PUT`/`DELETE`) require `requireAuth`. This is a different pattern from Residents/Executives-the-admin-view, which gate the entire page behind `LoginForm`; don't assume every page follows the same all-or-nothing gating.

## Commands

- `npm run dev` — dev server on :3000
- `npm run build` — production build (also runs ESLint + TypeScript checking)
- `npm run lint` — ESLint only
- `psql -d happyland_estate -f backend/schema.sql` — (re)load schema
- `node backend/scripts/create-user.ts <username> <password> [admin|staff]` — create/update a login

## Environment

Copy `.env.local.example` → `.env.local`. Required: `PGHOST`/`PGPORT`/`PGUSER`/`PGPASSWORD`/`PGDATABASE`, `JWT_SECRET`.

Postgres itself runs locally as a Windows service (`postgresql-x64-18`); `psql` is not on PATH by default, use the full path under `C:\Program Files\PostgreSQL\18\bin\` if needed. If the app can't reach the database, check that this service is running (`Get-Service postgresql*` in PowerShell) before assuming anything else is wrong.

## Verifying a change

Always run `npm run build` before considering a change done — it catches compile errors, TypeScript errors, and ESLint issues (`next lint` rules run as part of build). There's no test suite; manual verification via `npm run dev` is the only other check available.

## Deployment (Hostinger)

Production runs on Hostinger's Node.js app hosting (hPanel), pointed at the Supabase Postgres project via `PGHOST=aws-0-eu-west-1.pooler.supabase.com` (session pooler, port 5432, user `postgres.ppdvgtncowodlmkrxxpi`) — never the direct `db.<ref>.supabase.co` host, which is IPv6-only and unreachable from Hostinger. `JWT_SECRET` and all `PG*` vars are set directly in hPanel's environment variable UI, not committed anywhere.

This setup has caused multiple real outages, always with the same symptom: the homepage still loads (served from a stale Next.js/CDN cache — check for `x-nextjs-cache: HIT` and a large `Age` header to confirm), while every other route, including login, returns `503`. Root causes so far:

1. **Rebuilding while the app is still running** corrupts `.next` (old and new chunks coexist, causing `Cannot find module './NNN.js'` errors) — always **stop the app, then build, then start it**, never rebuild live.
2. **Environment variables reset or mistyped** between deploys (e.g. `PGUSER`/`PGDATABASE` swapped) — if the site is up but every DB-backed request fails, re-verify the env vars against the values above before looking anywhere else.
3. **A risky server-startup hook** (an earlier `instrumentation.js` that called `sharp.block()` unconditionally) was suspected of crashing the process on Hostinger's platform-specific `sharp` build; it was reverted along with a `postcss`/`sharp` dependency bump rather than root-caused, so those two `npm audit` findings are currently unresolved again — re-apply carefully (test the built app actually boots, don't add unguarded native-module calls to a startup hook) rather than blindly redoing the same commits.
4. **Stale client after a redeploy**: a browser tab open (or cached) from before a redeploy will throw `ChunkLoadError` / ~404s for `_next/static/chunks/...` when it tries to client-side-navigate, since those filenames are content-hashed and change on every build. Not a bug — a hard refresh fixes it. Don't chase this as if it were a server-side issue.

When the site is down: check hPanel's **runtime log** (not the build log) first — an empty runtime log means the process never started (check the build log instead, and confirm the app shows "Running"); a runtime log with a stack trace tells you exactly what crashed. Note that reverting to a commit previously confirmed working live is **not** a guaranteed fix — it has failed to resolve an outage at least once, meaning the deploy process itself (not the code) was at fault that time.
