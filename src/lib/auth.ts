import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'student' | 'professor' | 'admin';
}

const VALID_ROLES = new Set(['student', 'professor', 'admin']);

function getForwardedPayload(request: NextRequest): JWTPayload | null {
  const raw = request.headers.get('x-auth-payload');
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<JWTPayload>;
    if (
      typeof parsed.userId === 'string' &&
      typeof parsed.email === 'string' &&
      typeof parsed.role === 'string' &&
      VALID_ROLES.has(parsed.role)
    ) {
      return {
        userId: parsed.userId,
        email: parsed.email,
        role: parsed.role as JWTPayload['role'],
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function verifyToken(request: NextRequest): JWTPayload | null {
  try {
    const forwardedPayload = getForwardedPayload(request);
    if (forwardedPayload) {
      return forwardedPayload;
    }

    const cookieToken = request.cookies.get('token')?.value;
    const authHeader = request.headers.get('authorization');
    const token = cookieToken || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null);

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function requireAuth(request: NextRequest, allowedRoles?: string[]) {
  const payload = verifyToken(request);
  if (!payload) {
    throw new Error('Unauthorized');
  }

  if (allowedRoles && !allowedRoles.includes(payload.role)) {
    throw new Error('Forbidden');
  }

  return payload;
}