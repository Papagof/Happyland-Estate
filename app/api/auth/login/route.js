import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '@/backend/db';
import { getClientKey, isRateLimited, recordFailedAttempt, clearAttempts } from '@/backend/rateLimit';

export async function POST(request) {
  const clientKey = getClientKey(request);
  if (isRateLimited(clientKey)) {
    return NextResponse.json({ error: 'Too many login attempts. Try again in 15 minutes.' }, { status: 429 });
  }

  const { username, password } = await request.json();
  if (!username || !password) {
    return NextResponse.json({ error: 'username and password are required' }, { status: 400 });
  }

  const result = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    recordFailedAttempt(clientKey);
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  }
  clearAttempts(clientKey);

  const token = jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );

  return NextResponse.json({ token, user: { id: user.id, username: user.username, role: user.role } });
}
