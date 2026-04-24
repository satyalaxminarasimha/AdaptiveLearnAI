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
const JWT_SECRET_BYTES = new TextEncoder().encode(JWT_SECRET);

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
    const queryToken = request.nextUrl.searchParams.get('token');
    const token =
      request.cookies.get('token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '') ||
      (pathname.startsWith('/api/public-chat/') && pathname.endsWith('/stream') ? queryToken || undefined : undefined);

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET_BYTES);
      const tokenPayload = payload as TokenPayload;
      const tokenRole = tokenPayload.role;

      // Forward verified auth payload so route handlers can skip verifying the same token again.
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set(
        'x-auth-payload',
        JSON.stringify({
          userId: tokenPayload.userId,
          email: tokenPayload.email,
          role: tokenPayload.role,
        })
      );

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

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
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
    '/dashboard/:path*',
    '/api/:path*',
  ],
};