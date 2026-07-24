import { NextResponse } from 'next/server';
import pool from '@/backend/db';

export async function GET() {
  const result = await pool.query('SELECT COUNT(*) FROM residents');
  return NextResponse.json({ count: Number(result.rows[0].count) });
}
