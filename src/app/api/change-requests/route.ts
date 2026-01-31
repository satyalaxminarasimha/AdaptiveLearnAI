import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ChangeRequest from '@/models/ChangeRequest';
import { verifyToken } from '@/lib/auth';

// GET - Get all change requests (for admin) or user's own requests
export async function GET(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    let query = {};
    
    // Admin sees all requests, users see only their own
    if (payload.role !== 'admin') {
      query = { userId: payload.userId };
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    if (status && status !== 'all') {
      query = { ...query, status };
    }

    const requests = await ChangeRequest.find(query)
      .populate('userId', 'name email role')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Get change requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new change request
export async function POST(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (payload.role === 'admin') {
      return NextResponse.json({ error: 'Admins cannot create change requests' }, { status: 400 });
    }

    await dbConnect();

    const body = await request.json();
    const { requestType, title, description, requestedChanges } = body;

    const changeRequest = new ChangeRequest({
      userId: payload.userId,
      userRole: payload.role,
      requestType,
      title,
      description,
      requestedChanges,
      status: 'pending',
    });

    await changeRequest.save();

    return NextResponse.json({
      message: 'Change request submitted successfully',
      request: changeRequest,
    }, { status: 201 });
  } catch (error) {
    console.error('Create change request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
