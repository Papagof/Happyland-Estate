import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

function toUser(row) {
  return { id: row.id, username: row.username, role: row.role, createdAt: row.created_at };
}

export async function GET(request) {
  const { error } = requireAdmin(request);
  if (error) return error;

  const result = await pool.query('SELECT * FROM users ORDER BY id');
  return NextResponse.json(result.rows.map(toUser));
}

export async function POST(request) {
  const { error } = requireAdmin(request);
  if (error) return error;

  const { username, password, role } = await request.json();
  if (!username || !password) {
    return NextResponse.json({ error: 'username and password are required' }, { status: 400 });
  }
  if (role && !['admin', 'authorized'].includes(role)) {
    return NextResponse.json({ error: 'role must be "admin" or "authorized"' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING *`,
      [username, passwordHash, role || 'authorized']
    );
    return NextResponse.json(toUser(result.rows[0]), { status: 201 });
  } catch (err) {
    if (err.code === '23505') {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }
    throw err;
  }
}
