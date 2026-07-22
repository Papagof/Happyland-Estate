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
