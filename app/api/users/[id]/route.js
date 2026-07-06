import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

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
