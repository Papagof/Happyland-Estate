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

export async function PUT(request, { params }) {
  const { error } = requireAuth(request);
  if (error) return error;

  const { id } = await params;
  const { name, position, startYear, endYear, phone, isActive, displayOrder } = await request.json();
  if (!name || !position || !startYear || !endYear) {
    return NextResponse.json({ error: 'name, position, startYear and endYear are required' }, { status: 400 });
  }

  const result = await pool.query(
    `UPDATE executives SET name=$1, position=$2, start_year=$3, end_year=$4, phone=$5, is_active=$6, display_order=$7
     WHERE id=$8 RETURNING *`,
    [name, position, Number(startYear), Number(endYear), phone || null, isActive !== false, Number(displayOrder) || 0, id]
  );
  if (result.rows.length === 0) return NextResponse.json({ error: 'Executive not found' }, { status: 404 });
  return NextResponse.json(toExecutive(result.rows[0]));
}

export async function DELETE(request, { params }) {
  const { error } = requireAuth(request);
  if (error) return error;

  const { id } = await params;
  await pool.query('DELETE FROM executives WHERE id=$1', [id]);
  return new Response(null, { status: 204 });
}
