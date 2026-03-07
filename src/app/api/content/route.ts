import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AdminContent from '@/models/AdminContent';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get user role from token if available
    let userRole: string | null = null;
    const decoded = verifyToken(request);
    if (decoded) {
      userRole = decoded.role || null;
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query for active content
    const query: any = {
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    };

    // Filter by type if specified
    if (type) {
      query.type = type;
    }

    // If user is authenticated, filter by their role
    if (userRole) {
      query.targetAudience = { $in: [userRole] };
    } else {
      // For unauthenticated users, show content for all audiences
      query.targetAudience = { $in: ['students', 'professors', 'admins'] };
    }

    const contents = await AdminContent.find(query)
      .populate('createdBy', 'name')
      .sort({ priority: -1, publishedAt: -1 })
      .limit(limit);

    return NextResponse.json({ contents });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}