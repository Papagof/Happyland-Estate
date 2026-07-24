# Happyland Estate

A web app for managing residents/landlords, properties, estate management members,
and service charge payments for Happyland Estate.

Built with [Next.js 15](https://nextjs.org) (App Router), [Tailwind CSS](https://tailwindcss.com), and PostgreSQL.

This is a single Next.js app — `app/` (routing) and `public/` (static assets) must stay at the project root, but everything else is split into `backend/` (server-only code) and `frontend/` (client-only code), both imported into `app/` via the `@/*` path alias.

## Project structure

- `app/` — pages and API routes (App Router); imports everything below via `@/backend/*` and `@/frontend/*`
  - `app/api/` — REST endpoints backed by PostgreSQL
- `backend/` — server-only code
  - `db.js` — PostgreSQL connection pool
  - `auth.js` — JWT auth helpers (`requireAuth`, `requireAdmin`)
  - `schema.sql` — PostgreSQL schema
  - `scripts/create-user.js` — admin/staff account creation script
- `frontend/` — client-only code
  - `lib/api-client.js` — fetch wrapper for `/api/*`
  - `context/` — auth context/provider/hook
  - `components/` — shared UI components
  - `styles/globals.css` — Tailwind entrypoint + global styles

## Setup

### 1. Database

Create a PostgreSQL database and load the schema:

```sh
createdb happyland_estate
psql -d happyland_estate -f backend/schema.sql
```

(On Windows, if `psql` isn't on your PATH, use the full path from your PostgreSQL install, e.g. `"C:\Program Files\PostgreSQL\18\bin\psql.exe"`.)

### 2. App

```sh
npm install
cp .env.local.example .env.local   # edit with your PostgreSQL credentials, and set JWT_SECRET
npm run dev                        # runs on http://localhost:3000
```

Generate a `JWT_SECRET` with:

```sh
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

#### Creating admin / staff logins

The Residents & Landlords, Management, and User Accounts pages require signing in. Create accounts with:

```sh
node backend/scripts/create-user.js <username> <password> [admin|staff]
```

Running it again for an existing username updates that user's password/role. `admin` has full access, including managing other accounts; `staff` can manage Residents & Executives but not accounts.

## API

| Resource    | Endpoints | Auth |
|-------------|-----------|------|
| Auth        | `POST /api/auth/login` | — |
| Users       | `GET/POST /api/users`, `DELETE /api/users/:id` | admin |
| Residents   | `GET/POST /api/residents`, `PUT/DELETE /api/residents/:id` | required |
| Executives  | `GET/POST /api/executives`, `GET /api/executives/active-count`, `GET /api/executives/active`, `GET /api/executives/inactive`, `PUT/DELETE /api/executives/:id` | required (except active-count, active, inactive) |
| Properties  | `GET/POST /api/properties`, `PUT/DELETE /api/properties/:id` | required (except GET) |
| Payments    | `GET/POST /api/payments` | — |
| Contact     | `POST /api/contact` | — |

Residents, Executives, and property-write endpoints require an `Authorization: Bearer <token>` header from `/api/auth/login`; Users endpoints additionally require the `admin` role. The Residents & Landlords, Management, and User Accounts pages are likewise only usable by signed-in users (User Accounts further requires the `admin` role) — the Properties page stays publicly viewable, but only signed-in users see the add/remove controls.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint with ESLint
