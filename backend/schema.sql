-- Happyland Estate database schema (PostgreSQL)

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'authorized' CHECK (role IN ('admin', 'authorized')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS residents (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  street_name TEXT NOT NULL,
  house_number TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'resident',
  occupation TEXT,
  move_in_date DATE
);

CREATE TABLE IF NOT EXISTS executives (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  term TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  street_name TEXT NOT NULL,
  house_number TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'rent',
  bedrooms INTEGER,
  bathrooms INTEGER,
  price NUMERIC,
  description TEXT,
  available BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  resident_name TEXT NOT NULL,
  property_address TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  method TEXT NOT NULL DEFAULT 'bank_transfer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
