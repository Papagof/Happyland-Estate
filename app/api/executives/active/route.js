import { NextResponse } from 'next/server';
import pool from '@/backend/db';

export async function GET() {
  const result = await pool.query(
    'SELECT id, name, position, term, display_order FROM executives WHERE is_active = true ORDER BY display_order, id'
  );
  return NextResponse.json(
    result.rows.map((row) => ({ id: row.id, name: row.name, position: row.position, term: row.term || '', displayOrder: row.display_order }))
  );
}
