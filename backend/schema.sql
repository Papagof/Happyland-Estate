-- Happyland Estate database schema
-- Usage: createdb happyland_estate && psql -d happyland_estate -f backend/schema.sql

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS residents (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  phone         TEXT,
  email         TEXT,
  street_name   TEXT NOT NULL,
  house_number  TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'resident' CHECK (type IN ('resident', 'landlord', 'both')),
  occupation    TEXT,
  move_in_date  DATE
);

CREATE TABLE IF NOT EXISTS executives (
  id             SERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  position       TEXT NOT NULL,
  term           TEXT,
  phone          TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  display_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS properties (
  id            SERIAL PRIMARY KEY,
  street_name   TEXT NOT NULL,
  house_number  TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'rent' CHECK (type IN ('rent', 'sale', 'both')),
  bedrooms      INTEGER,
  bathrooms     INTEGER,
  price         NUMERIC,
  description   TEXT,
  available     BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS payments (
  id                SERIAL PRIMARY KEY,
  reference         TEXT NOT NULL UNIQUE,
  resident_name     TEXT NOT NULL,
  property_address  TEXT NOT NULL,
  amount            NUMERIC NOT NULL,
  method            TEXT NOT NULL DEFAULT 'bank_transfer',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  subject     TEXT,
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
