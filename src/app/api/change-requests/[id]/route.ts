import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ChangeRequest from '@/models/ChangeRequest';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

// GET - Get a specific change request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const changeRequest = await ChangeRequest.findById(id)
      .populate('userId', 'name email role')
      .populate('reviewedBy', 'name');

    if (!changeRequest) {
      return NextResponse.json({ error: 'Change request not found' }, { status: 404 });
    }

    // Check authorization
    if (payload.role !== 'admin' && changeRequest.userId._id.toString() !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(changeRequest);
  } catch (error) {
    console.error('Get change request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update change request (admin only - approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = verifyToken(request);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const body = await request.json();
    const { status, adminResponse, applyChanges } = body;

    const changeRequest = await ChangeRequest.findById(id);
    if (!changeRequest) {
      return NextResponse.json({ error: 'Change request not found' }, { status: 404 });
    }

    // Update the request
    changeRequest.status = status;
    changeRequest.adminResponse = adminResponse;
    changeRequest.reviewedBy = payload.userId;
    changeRequest.reviewedAt = new Date();

    // If approved and applyChanges is true, update the user's details
    if (status === 'approved' && applyChanges) {
      const updates: Record<string, string> = {};
      for (const change of changeRequest.requestedChanges) {
        updates[change.field] = change.newValue;
      }
      await User.findByIdAndUpdate(changeRequest.userId, updates);
    }

    await changeRequest.save();

    return NextResponse.json({
      message: `Change request ${status}`,
      request: changeRequest,
    });
  } catch (error) {
    console.error('Update change request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a change request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const changeRequest = await ChangeRequest.findById(id);
    if (!changeRequest) {
      return NextResponse.json({ error: 'Change request not found' }, { status: 404 });
    }

    // Only admin or the owner can delete
    if (payload.role !== 'admin' && changeRequest.userId.toString() !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await ChangeRequest.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Change request deleted' });
  } catch (error) {
    console.error('Delete change request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
