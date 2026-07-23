import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/backend/db';
import { requireAdmin } from '@/backend/auth';

function toUser(row) {
  return { id: row.id, username: row.username, role: row.role, createdAt: row.created_at };
}

export async function PUT(request, { params }) {
  const { error } = requireAdmin(request);
  if (error) return error;

  const { id } = await params;
  const { password } = await request.json();
  if (!password) {
    return NextResponse.json({ error: 'password is required' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2 RETURNING *', [passwordHash, id]);
  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json(toUser(result.rows[0]));
}

export async function DELETE(request, { params }) {
  const { user, error } = requireAdmin(request);
  if (error) return error;

  const { id } = await params;
  if (Number(id) === user.sub) {
    return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
  }

  await pool.query('DELETE FROM users WHERE id=$1', [id]);
  return new Response(null, { status: 204 });
}
