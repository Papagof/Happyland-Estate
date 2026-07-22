import { NextResponse } from 'next/server';
import pool from '@/backend/db';

function toMessage(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject || '',
    message: row.message,
    createdAt: row.created_at
  };
}

export async function POST(request) {
  const { name, email, subject, message } = await request.json();
  if (!name || !email || !message) {
    return NextResponse.json({ error: 'name, email and message are required' }, { status: 400 });
  }

  const result = await pool.query(
    `INSERT INTO contact_messages (name, email, subject, message) VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, email, subject || null, message]
  );
  return NextResponse.json(toMessage(result.rows[0]), { status: 201 });
}
