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

export async function PUT(request, { params }) {
  const { error } = requireAuth(request);
  if (error) return error;

  const { id } = await params;
  const { streetName, houseNumber, type, bedrooms, bathrooms, price, description, available } = await request.json();
  const result = await pool.query(
    `UPDATE properties SET street_name=$1, house_number=$2, type=$3, bedrooms=$4, bathrooms=$5, price=$6, description=$7, available=$8
     WHERE id=$9 RETURNING *`,
    [streetName, houseNumber, type || 'rent', bedrooms || null, bathrooms || null, price || null, description || null, available !== false, id]
  );
  if (result.rows.length === 0) return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  return NextResponse.json(toProperty(result.rows[0]));
}

export async function DELETE(request, { params }) {
  const { error } = requireAuth(request);
  if (error) return error;

  const { id } = await params;
  await pool.query('DELETE FROM properties WHERE id=$1', [id]);
  return new Response(null, { status: 204 });
}
