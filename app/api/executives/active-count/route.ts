import { NextResponse } from 'next/server';
import pool from '@/backend/db';

export async function GET() {
  const result = await pool.query('SELECT COUNT(*) FROM executives WHERE is_active = true');
  return NextResponse.json({ count: Number(result.rows[0].count) });
}
