import { NextResponse } from 'next/server';
import pool from '@/backend/db';
import { requireAuth } from '@/backend/auth';

function toExecutive(row) {
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    startYear: row.start_year,
    endYear: row.end_year,
    phone: row.phone || '',
    isActive: row.is_active,
    displayOrder: row.display_order
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

  const { name, position, startYear, endYear, phone, isActive, displayOrder } = await request.json();
  if (!name || !position || !startYear || !endYear) {
    return NextResponse.json({ error: 'name, position, startYear and endYear are required' }, { status: 400 });
  }

  const result = await pool.query(
    `INSERT INTO executives (name, position, start_year, end_year, phone, is_active, display_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [name, position, Number(startYear), Number(endYear), phone || null, isActive !== false, Number(displayOrder) || 0]
  );
  return NextResponse.json(toExecutive(result.rows[0]), { status: 201 });
}
