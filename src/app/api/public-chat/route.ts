import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PublicChat from '@/models/PublicChat';
import { verifyToken } from '@/lib/auth';

// GET - Get chat rooms for a user
export async function GET(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const roomType = searchParams.get('roomType');
    const batch = searchParams.get('batch');
    const section = searchParams.get('section');
    const subject = searchParams.get('subject');

    let query: Record<string, unknown> = { isActive: true };

    if (roomType) {
      query.roomType = roomType;
    }
    if (batch) {
      query.batch = batch;
    }
    if (section) {
      query.section = section;
    }
    if (subject) {
      query.subject = subject;
    }

    const chatRooms = await PublicChat.find(query)
      .populate('professorId', 'name expertise')
      .select('-messages') // Don't send all messages in list
      .sort({ updatedAt: -1 });

    return NextResponse.json(chatRooms);
  } catch (error) {
    console.error('Get public chats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new chat room (professor only for subject chats)
export async function POST(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { roomType, batch, section, subject } = body;

    // Check if room already exists
    let existingRoom;
    if (roomType === 'class') {
      existingRoom = await PublicChat.findOne({ roomType, batch, section });
    } else if (roomType === 'subject') {
      existingRoom = await PublicChat.findOne({ roomType, subject, professorId: payload.userId });
    }

    if (existingRoom) {
      return NextResponse.json(existingRoom);
    }

    // Create new room
    const newRoom = new PublicChat({
      roomType,
      batch,
      section,
      subject,
      professorId: payload.role === 'professor' ? payload.userId : undefined,
      messages: [],
      participants: [payload.userId],
      isActive: true,
    });

    await newRoom.save();

    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    console.error('Create public chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
