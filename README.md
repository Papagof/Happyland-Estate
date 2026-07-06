# Happyland Estate

A web app for managing residents/landlords, properties, estate management members,
and service charge payments for Happyland Estate.

## Project structure

- `frontend/` — Vite + React app (UI)
- `backend/` — Express API backed by PostgreSQL

## Setup

### 1. Database

Create a PostgreSQL database and load the schema:

```sh
createdb happyland_estate
psql -d happyland_estate -f backend/schema.sql
```

### 2. Backend

```sh
cd backend
cp .env.example .env   # edit with your PostgreSQL credentials, and set JWT_SECRET
npm install
npm run dev             # runs on http://localhost:4000
```

Generate a `JWT_SECRET` with:

```sh
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

#### Creating admin / authorized logins

The Residents & Landlords and Management pages require signing in. Create accounts with:

```sh
node scripts/create-user.js <username> <password> [admin|authorized]
```

Running it again for an existing username updates that user's password/role.

### 3. Frontend

```sh
cd frontend
npm install
npm run dev              # runs on http://localhost:5173, proxies /api to the backend
```

## API

| Resource    | Endpoints | Auth |
|-------------|-----------|------|
| Auth        | `POST /api/auth/login` | — |
| Residents   | `GET/POST /api/residents`, `PUT/DELETE /api/residents/:id` | required |
| Executives  | `GET/POST /api/executives`, `PUT/DELETE /api/executives/:id` | required |
| Properties  | `GET/POST /api/properties`, `PUT/DELETE /api/properties/:id` | — |
| Payments    | `GET/POST /api/payments` | — |

Residents and Executives endpoints require an `Authorization: Bearer <token>` header from `/api/auth/login`. The frontend's Residents & Landlords and Management pages are likewise only visible/usable to signed-in admin/authorized users.
