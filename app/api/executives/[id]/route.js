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
    isActive: row.is_active,
    displayOrder: row.display_order
  };
}

export async function PUT(request, { params }) {
  const { error } = requireAuth(request);
  if (error) return error;

  const { id } = await params;
  const { name, position, term, phone, isActive, displayOrder } = await request.json();
  const result = await pool.query(
    `UPDATE executives SET name=$1, position=$2, term=$3, phone=$4, is_active=$5, display_order=$6
     WHERE id=$7 RETURNING *`,
    [name, position, term || null, phone || null, isActive !== false, Number(displayOrder) || 0, id]
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
