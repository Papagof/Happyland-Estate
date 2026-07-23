import { NextResponse } from 'next/server';
import pool from '@/backend/db';

export async function GET() {
  const result = await pool.query('SELECT id, name, position, term FROM executives WHERE is_active = true ORDER BY id');
  return NextResponse.json(result.rows.map((row) => ({ id: row.id, name: row.name, position: row.position, term: row.term || '' })));
}
