import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AdminContent from '@/models/AdminContent';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Verify admin access
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');
    const targetAudience = searchParams.get('targetAudience');

    // Build query
    const query: any = {};
    if (type) query.type = type;
    if (isActive !== null) query.isActive = isActive === 'true';
    if (targetAudience) query.targetAudience = { $in: [targetAudience] };

    const contents = await AdminContent.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ contents });
  } catch (error) {
    console.error('Error fetching admin content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Verify admin access
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, type, priority, targetAudience, publishedAt, expiresAt } = body;

    // Validate required fields
    if (!title || !content || !type || !targetAudience || targetAudience.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create new admin content
    const newContent = new AdminContent({
      title,
      content,
      type,
      priority: priority || 'medium',
      targetAudience,
      isActive: true,
      createdBy: decoded.id,
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    await newContent.save();

    const populatedContent = await AdminContent.findById(newContent._id)
      .populate('createdBy', 'name email');

    return NextResponse.json({
      message: 'Content created successfully',
      content: populatedContent
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating admin content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}