import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { withApiTiming } from '@/lib/api-timing';

// GET - Get current authenticated user
export async function GET(request: NextRequest) {
  return withApiTiming('GET /api/auth/me', async () => {
    try {
      const payload = verifyToken(request);
      if (!payload) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

    await dbConnect();

    const user = await User.findById(payload.userId)
      .select([
        '_id',
        'name',
        'email',
        'role',
        'isApproved',
        'avatarUrl',
        'rollNo',
        'batch',
        'section',
        'branch',
        'semester',
        'department',
        'expertise',
        'phoneNumber',
      ].join(' '))
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

      return NextResponse.json(user, {
        headers: {
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=120',
        },
      });
    } catch (error) {
      console.error('Get current user error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
