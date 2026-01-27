import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    requireAuth(request, ['admin']);

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const approved = searchParams.get('approved');

    let query: any = {};
    if (role) query.role = role;
    if (approved !== null) query.isApproved = approved === 'true';

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}