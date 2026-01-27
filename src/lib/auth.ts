import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'student' | 'professor' | 'admin';
}

export function verifyToken(request: NextRequest): JWTPayload | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
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