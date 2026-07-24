import { NextResponse } from 'next/server';
import pool from '@/backend/db';

export async function GET() {
  const result = await pool.query(
    'SELECT id, name, position, start_year, end_year, display_order FROM executives WHERE is_active = true ORDER BY start_year DESC, display_order, id'
  );
  return NextResponse.json(
    result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      position: row.position,
      startYear: row.start_year,
      endYear: row.end_year,
      displayOrder: row.display_order
    }))
  );
}
