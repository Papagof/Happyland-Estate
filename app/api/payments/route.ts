import { NextResponse } from 'next/server';
import pool from '@/backend/db';

function toPayment(row) {
  return {
    id: row.id,
    reference: row.reference,
    residentName: row.resident_name,
    propertyAddress: row.property_address,
    amount: row.amount,
    method: row.method,
    createdAt: row.created_at
  };
}

export async function GET() {
  const result = await pool.query('SELECT * FROM payments ORDER BY created_at DESC');
  return NextResponse.json(result.rows.map(toPayment));
}

export async function POST(request) {
  const { residentName, propertyAddress, amount, method } = await request.json();
  if (!residentName || !propertyAddress || !amount) {
    return NextResponse.json({ error: 'residentName, propertyAddress and amount are required' }, { status: 400 });
  }

  const reference = `HE-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const result = await pool.query(
    `INSERT INTO payments (reference, resident_name, property_address, amount, method)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [reference, residentName, propertyAddress, amount, method || 'bank_transfer']
  );
  return NextResponse.json(toPayment(result.rows[0]), { status: 201 });
}
