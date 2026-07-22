import { NextResponse } from 'next/server';
import pool from '@/backend/db';
import { requireAuth } from '@/backend/auth';

function toExecutive(row) {
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    term: row.term || '',
    phone: row.phone || '',
    isActive: row.is_active
  };
}

export async function GET(request) {
  const { error } = requireAuth(request);
  if (error) return error;

  const result = await pool.query('SELECT * FROM executives ORDER BY id');
  return NextResponse.json(result.rows.map(toExecutive));
}

export async function POST(request) {
  const { error } = requireAuth(request);
  if (error) return error;

  const { name, position, term, phone, isActive } = await request.json();
  if (!name || !position) {
    return NextResponse.json({ error: 'name and position are required' }, { status: 400 });
  }

  const result = await pool.query(
    `INSERT INTO executives (name, position, term, phone, is_active)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, position, term || null, phone || null, isActive !== false]
  );
  return NextResponse.json(toExecutive(result.rows[0]), { status: 201 });
}
