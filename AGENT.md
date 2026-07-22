# AGENT.md

Guidance for AI coding agents working in this repo. See [README.md](README.md) for human-facing setup instructions.

## Architecture

Single Next.js 15 App Router app — not a monorepo, not two deployable services. `app/` (routing) and `public/` (static assets) must stay at the project root because Next.js requires it. Everything else is split by concern:

- `backend/` — server-only code, never imported by client components
  - `db.js` — the shared `pg` `Pool` singleton (`export default pool`)
  - `auth.js` — `getUser(request)`, `requireAuth(request)`, `requireAdmin(request)` — JWT verification against `process.env.JWT_SECRET`
  - `supabase.js` — `createClient()` (async, cookie-aware, for Server Components/Server Actions/Route Handlers) and `createAdminClient()` (secret key, bypasses RLS). **Not called by any route yet** — the app's real data layer is still `db.js` + `auth.js`. The Supabase project itself is live and reachable (verified), but nothing in the app queries it. Don't assume a feature is Supabase-backed without checking.
  - `supabaseMiddleware.js` — `updateSupabaseSession(request)`, called from the root `middleware.js`. Refreshes the Supabase auth cookie on every request so Server Components don't see a stale session — this is plumbing, not route protection. It does not redirect unauthenticated requests anywhere; add that deliberately if/when a page actually depends on a Supabase session.
  - `schema.sql` — the only source of truth for Postgres table shape; there is no ORM
  - `scripts/create-user.js` — run with `node backend/scripts/create-user.js <username> <password> [admin|staff]`
  - `supabase/` — local Supabase CLI config from `supabase init` (no Docker on this machine, so no live local stack — CLI use is limited to project linking/migrations against the remote project)
- `middleware.js` (project root, required Next.js filename — can't be moved into `backend/`) — thin wrapper calling `updateSupabaseSession`
- `frontend/` — client-only code (everything here assumes it runs in the browser)
  - `lib/api-client.js` — the only place `fetch('/api/...')` should be called from pages; every resource has a `xApi` object (`residentsApi`, `executivesApi`, etc.) with `list/create/update/remove` methods
  - `lib/supabaseClient.js` — `createClient()`, a browser-side Supabase client (publishable key only). Not imported anywhere yet — same "scaffolding, not wired in" caveat as `backend/supabase.js`.
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

- Login: `POST /api/auth/login` → bcrypt-compares against `users.password_hash`, signs a JWT with `{ sub, username, role }`, 12h expiry
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

Copy `.env.local.example` → `.env.local`. Required: `PGHOST`/`PGPORT`/`PGUSER`/`PGPASSWORD`/`PGDATABASE`, `JWT_SECRET`. `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are set to a real project (Settings > API in the Supabase dashboard) and are what powers `middleware.js`, `backend/supabase.js`, and `frontend/lib/supabaseClient.js` — but no feature actually depends on them yet, so leaving them blank only disables that scaffolding, not the app. `SUPABASE_SECRET_KEY` is optional and only needed if server code needs to bypass RLS — never expose it to the browser.

Note the current Supabase key naming: **publishable key** (`sb_publishable_...`, browser-safe) and **secret key** (`sb_secret_...`, server-only) replaced the older "anon key" / "service_role key" terminology. Don't reintroduce `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY` — those are the legacy names.

Two gotchas hit while wiring this up, worth knowing before touching it again:
- Supabase's official Next.js example (as of writing) uses a root `proxy.ts` file with `export async function proxy()` instead of `middleware.ts`/`export function middleware()`. That's from Next.js's canary channel — **this project's installed Next.js (15.5.21) does not recognize `proxy.ts` at all** (verified against `node_modules/next/dist/lib/constants.js`, which only defines `MIDDLEWARE_FILENAME`). Stick with `middleware.js` + `export function middleware()` unless Next.js is upgraded and this is re-verified.
- Current Supabase guidance is to call `supabase.auth.getClaims()` in server code (middleware, Server Components) rather than `getSession()` (unions/spoofable) or plain `getUser()`. This is what `backend/supabaseMiddleware.js` does to trigger the token-refresh side effect.

Postgres itself runs locally as a Windows service (`postgresql-x64-18`); `psql` is not on PATH by default, use the full path under `C:\Program Files\PostgreSQL\18\bin\` if needed.

## Verifying a change

Always run `npm run build` before considering a change done — it catches both compile errors and ESLint issues (`next lint` rules run as part of build). There's no test suite; manual verification via `npm run dev` is the only other check available.
