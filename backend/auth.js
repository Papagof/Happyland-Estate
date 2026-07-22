import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function getUser(request) {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function requireAuth(request) {
  const user = getUser(request);
  if (!user) {
    return { user: null, error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) };
  }
  return { user, error: null };
}

export function requireAdmin(request) {
  const { user, error } = requireAuth(request);
  if (error) return { user: null, error };
  if (user.role !== 'admin') {
    return { user: null, error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }) };
  }
  return { user, error: null };
}
