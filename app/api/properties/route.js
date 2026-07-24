import { NextResponse } from 'next/server';
import pool from '@/backend/db';
import { requireAuth } from '@/backend/auth';

function toProperty(row) {
  return {
    id: row.id,
    streetName: row.street_name,
    houseNumber: row.house_number,
    type: row.type,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    price: row.price,
    description: row.description || '',
    available: row.available
  };
}

export async function GET() {
  const result = await pool.query('SELECT * FROM properties ORDER BY id');
  return NextResponse.json(result.rows.map(toProperty));
}

export async function POST(request) {
  const { error } = requireAuth(request);
  if (error) return error;

  const { streetName, houseNumber, type, bedrooms, bathrooms, price, description, available } = await request.json();
  if (!streetName || !houseNumber) {
    return NextResponse.json({ error: 'streetName and houseNumber are required' }, { status: 400 });
  }

  const result = await pool.query(
    `INSERT INTO properties (street_name, house_number, type, bedrooms, bathrooms, price, description, available)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [streetName, houseNumber, type || 'rent', bedrooms || null, bathrooms || null, price || null, description || null, available !== false]
  );
  return NextResponse.json(toProperty(result.rows[0]), { status: 201 });
}
