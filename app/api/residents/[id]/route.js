import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

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

export async function PUT(request, { params }) {
  const { error } = requireAuth(request);
  if (error) return error;

  const { id } = await params;
  const { name, phone, email, streetName, houseNumber, type, occupation, moveInDate } = await request.json();
  const result = await pool.query(
    `UPDATE residents SET name=$1, phone=$2, email=$3, street_name=$4, house_number=$5, type=$6, occupation=$7, move_in_date=$8
     WHERE id=$9 RETURNING *`,
    [name, phone || null, email || null, streetName, houseNumber, type || 'resident', occupation || null, moveInDate || null, id]
  );
  if (result.rows.length === 0) return NextResponse.json({ error: 'Resident not found' }, { status: 404 });
  return NextResponse.json(toResident(result.rows[0]));
}

export async function DELETE(request, { params }) {
  const { error } = requireAuth(request);
  if (error) return error;

  const { id } = await params;
  await pool.query('DELETE FROM residents WHERE id=$1', [id]);
  return new Response(null, { status: 204 });
}
