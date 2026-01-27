import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ChatSession from '@/models/ChatSession';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, messages, userRole } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const session = new ChatSession({
      userId: payload.userId,
      userRole: userRole || 'student',
      title: title || `Chat - ${new Date().toLocaleDateString()}`,
      messages: messages,
    });

    await session.save();

    return NextResponse.json({
      success: true,
      session: session,
    }, { status: 201 });
  } catch (error) {
    console.error('Save chat session error:', error);
    return NextResponse.json(
      { error: 'Failed to save chat session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');

    const sessions = await ChatSession.find({ userId: payload.userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('-messages'); // Don't fetch full messages in list view

    const total = await ChatSession.countDocuments({ userId: payload.userId });

    return NextResponse.json({
      sessions,
      total,
      limit,
      skip,
    });
  } catch (error) {
    console.error('Get chat sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat sessions' },
      { status: 500 }
    );
  }
}
