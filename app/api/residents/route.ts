import { NextResponse } from 'next/server';
import pool from '@/backend/db';
import { requireAuth } from '@/backend/auth';

function toResident(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone || '',
    email: row.email || '',
    streetName: row.street_name,
    houseNumber: row.house_number,
    type: row.type,
    occupation: row.occupation || '',
    moveInDate: row.move_in_date ? row.move_in_date.toISOString().slice(0, 10) : ''
  };
}

export async function GET(request) {
  const { error } = requireAuth(request);
  if (error) return error;

  const result = await pool.query('SELECT * FROM residents ORDER BY id');
  return NextResponse.json(result.rows.map(toResident));
}

export async function POST(request) {
  const { error } = requireAuth(request);
  if (error) return error;

  const { name, phone, email, streetName, houseNumber, type, occupation, moveInDate } = await request.json();
  if (!name || !streetName || !houseNumber) {
    return NextResponse.json({ error: 'name, streetName and houseNumber are required' }, { status: 400 });
  }

  const result = await pool.query(
    `INSERT INTO residents (name, phone, email, street_name, house_number, type, occupation, move_in_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [name, phone || null, email || null, streetName, houseNumber, type || 'resident', occupation || null, moveInDate || null]
  );
  return NextResponse.json(toResident(result.rows[0]), { status: 201 });
}
