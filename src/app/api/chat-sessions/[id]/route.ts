import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ChatSession from '@/models/ChatSession';
import { verifyToken } from '@/lib/auth';
import { Types } from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const session = await ChatSession.findOne({
      _id: new Types.ObjectId(id),
      userId: payload.userId,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Chat session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Get chat session error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat session' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const result = await ChatSession.deleteOne({
      _id: new Types.ObjectId(id),
      userId: payload.userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Chat session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete chat session error:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat session' },
      { status: 500 }
    );
  }
}
