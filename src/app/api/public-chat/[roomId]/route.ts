import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import PublicChat from '@/models/PublicChat';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { publishRoomMessage } from '@/lib/public-chat-events';

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

    const [chatRoom, chatMessages] = await Promise.all([
      PublicChat.findById(roomId)
        .populate('professorId', 'name expertise')
        .select('roomType batch section subject professorId participants')
        .lean(),
      PublicChat.findById(roomId)
        .select({ messages: { $slice: -(Math.max(limit, 1) + Math.max(skip, 0)) } })
        .lean(),
    ]);

    if (!chatRoom) {
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }

    // Return messages in chronological order so chat UI can append and stay anchored at bottom.
    const allMessages = ((chatMessages?.messages as Array<Record<string, unknown>>) || []).slice();
    const boundedSkip = Math.max(0, skip);
    const boundedLimit = Math.max(1, limit);
    const end = Math.max(0, allMessages.length - boundedSkip);
    const start = Math.max(0, end - boundedLimit);
    const messages = allMessages.slice(start, end);

    return NextResponse.json({
      roomId: chatRoom._id,
      roomType: chatRoom.roomType,
      batch: chatRoom.batch,
      section: chatRoom.section,
      subject: chatRoom.subject,
      professor: chatRoom.professorId,
      participantCount: Array.isArray(chatRoom.participants) ? chatRoom.participants.length : 0,
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

    const chatRoom = await PublicChat.findById(roomId).select('_id participants');
    if (!chatRoom) {
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }

    // Add message
    const newMessage = {
      _id: new mongoose.Types.ObjectId(),
      senderId: payload.userId,
      senderName: user.name,
      senderRole: user.role as 'student' | 'professor',
      message: message.trim(),
      timestamp: new Date(),
    };

    const updatedRoom = await PublicChat.findByIdAndUpdate(
      roomId,
      {
        $push: { messages: newMessage },
        $addToSet: { participants: payload.userId },
      },
      {
        new: true,
        select: 'participants',
      }
    ).lean();

    const participantCount = Array.isArray(updatedRoom?.participants)
      ? updatedRoom.participants.length
      : Array.isArray(chatRoom.participants)
        ? chatRoom.participants.length
        : 0;

    publishRoomMessage(roomId, {
      type: 'new-message',
      roomId,
      newMessage,
      participantCount,
    });

    return NextResponse.json({
      message: 'Message sent',
      newMessage,
      participantCount,
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
