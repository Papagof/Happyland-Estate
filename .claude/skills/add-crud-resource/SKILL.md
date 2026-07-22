---
name: add-crud-resource
description: Use when adding a new CRUD-backed resource (a new database table with a REST API and a management page) to the Happyland Estate app — e.g. "add a visitors log", "add a maintenance requests feature". Follows the existing residents/executives/properties pattern exactly so the new resource is indistinguishable in style from the rest of the app.
---

# Add a CRUD resource

This app has one consistent pattern for a resource backed by a Postgres table, a REST API, and a management page. Follow it exactly — don't introduce a new pattern (an ORM, a different response shape, a different auth style) for a single resource. `residents` is the canonical example to read alongside this skill: `backend/schema.sql`, `app/api/residents/route.js`, `app/api/residents/[id]/route.js`, `frontend/lib/api-client.js`, `app/residents/page.jsx`.

## Steps

1. **Table** — add a `CREATE TABLE IF NOT EXISTS` block to `backend/schema.sql`. Use `SERIAL PRIMARY KEY`, snake_case columns, `CHECK` constraints for enum-like fields (see `residents.type`), `BOOLEAN ... DEFAULT` for flags (see `properties.available`). This file is the only schema source — there's no migration tool or ORM.

2. **List/create route** — `app/api/<resource>/route.js`:
   - A private `to<Resource>(row)` function mapping snake_case DB columns to camelCase JSON keys (every route file has one, they're never shared/exported).
   - `export async function GET(request)` — call `requireAuth(request)` from `@/backend/auth` first and return `error` if present, unless the resource should be public (properties and payments are public today — check whether the new resource has the same intended visibility before adding an auth guard).
   - `export async function POST(request)` — same auth guard, validate required fields and return a 400 with `{ error: '...' }` if missing, then `pool.query` an `INSERT ... RETURNING *` with parameterized `$1, $2, ...`, respond `NextResponse.json(toResource(row), { status: 201 })`.
   - Import the pool from `@/backend/db`.

3. **Update/delete route** — `app/api/<resource>/[id]/route.js`: same `to<Resource>` mapper duplicated (not imported — this is the existing convention, keep it), `export async function PUT(request, { params })` and `export async function DELETE(request, { params })`, both starting with `const { id } = await params;` (params is a Promise in this Next.js version — always `await` it).

4. **Client methods** — add a `<resource>Api` object to `frontend/lib/api-client.js` with `list/create/update/remove` (and `count`/any custom read endpoint if needed, see `residentsApi.count` and `executivesApi.activeCount` for the pattern of a separate lightweight count route). Every method just calls the shared `request(path, options)` helper already defined in that file.

5. **Page** — `app/<resource>/page.jsx`, `'use client'`. Copy the shape of `app/residents/page.jsx` for an authenticated CRUD page (guards on `useAuth()`, renders `<LoginForm />` if not authenticated) or `app/properties/page.jsx` for a public one: an `emptyForm` constant, `useState` for the list + form + (if editable) an `editingX` record, a `useEffect` that fetches on mount (or on `isAuthenticated` change), a form built from a small array of `{ type, placeholder, key }` field descriptors mapped to `<input>`s, and a card grid rendering the list with Edit/Delete buttons. Reuse the existing inline `style={{...}}` values from a sibling page rather than inventing new colors/spacing — the app has no shared style constants, visual consistency comes from copying values directly (`#1E3A8A` primary, `#F8FAFC` background, `12px` border radius, `0 4px 12px rgba(15, 23, 42, 0.06)` card shadow, etc.).

6. **Nav entry** — add `{ href: '/<resource>', label: '...', icon: <LucideIcon>, restricted: true }` to `NAV_ITEMS` in `frontend/components/Navbar.jsx` (omit `restricted` for public resources, use `adminOnly: true` instead if it should match the Users page's admin-gating).

## Verify

Run `npm run build` — it must stay clean (no new ESLint warnings, no type errors). Then `npm run dev`, sign in via `/login`, and exercise create/edit/delete on the new page manually — there's no test suite, this is the only verification available.
