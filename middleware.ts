import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Edge Runtime compatible JWT verification using jose
import { jwtVerify } from 'jose';

type TokenPayload = {
  userId: string;
  email: string;
  role: 'student' | 'professor' | 'admin';
};

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes
  if (
    pathname.startsWith('/api/auth') ||
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Protected routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/')) {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const tokenRole = (payload as TokenPayload).role;

      if (pathname.startsWith('/dashboard')) {
        const expectedRole =
          pathname.startsWith('/dashboard/admin')
            ? 'admin'
            : pathname.startsWith('/dashboard/professor')
              ? 'professor'
              : pathname.startsWith('/dashboard/student')
                ? 'student'
                : null;

        if (!tokenRole) {
          return NextResponse.redirect(new URL('/', request.url));
        }

        if (expectedRole && tokenRole !== expectedRole) {
          return NextResponse.redirect(new URL(`/dashboard/${tokenRole}`, request.url));
        }
      }

      if (pathname.startsWith('/api/')) {
        const expectedApiRole =
          pathname.startsWith('/api/admin/')
            ? 'admin'
            : pathname.startsWith('/api/professors/')
              ? 'professor'
              : null;

        if (expectedApiRole && tokenRole !== expectedApiRole) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }

      return NextResponse.next();
    } catch (error) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};