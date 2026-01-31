import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PublicChat from '@/models/PublicChat';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

// GET - Get messages from a specific chat room
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { roomId } = await params;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    const chatRoom = await PublicChat.findById(roomId)
      .populate('professorId', 'name expertise')
      .populate('participants', 'name role');

    if (!chatRoom) {
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }

    // Get paginated messages (most recent first)
    const messages = chatRoom.messages
      .slice(-limit - skip, skip === 0 ? undefined : -skip)
      .reverse();

    return NextResponse.json({
      roomId: chatRoom._id,
      roomType: chatRoom.roomType,
      batch: chatRoom.batch,
      section: chatRoom.section,
      subject: chatRoom.subject,
      professor: chatRoom.professorId,
      participantCount: chatRoom.participants.length,
      messages,
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Send a message to the chat room
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { roomId } = await params;

    const body = await request.json();
    const { message } = body;

    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get user info
    const user = await User.findById(payload.userId).select('name role');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const chatRoom = await PublicChat.findById(roomId);
    if (!chatRoom) {
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }

    // Add message
    const newMessage = {
      senderId: payload.userId,
      senderName: user.name,
      senderRole: user.role as 'student' | 'professor',
      message: message.trim(),
      timestamp: new Date(),
    };

    chatRoom.messages.push(newMessage);

    // Add user to participants if not already
    if (!chatRoom.participants.includes(payload.userId)) {
      chatRoom.participants.push(payload.userId);
    }

    await chatRoom.save();

    return NextResponse.json({
      message: 'Message sent',
      newMessage,
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
