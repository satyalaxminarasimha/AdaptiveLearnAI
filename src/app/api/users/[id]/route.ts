import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';
import { Types } from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAuth(request, ['admin']);

    await dbConnect();

    const { id } = await params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAuth(request, ['admin']);

    await dbConnect();

    const { id } = await params;
    const body = await request.json();
    const { isApproved, role, name, email, rollNo, batch, section, expertise } = body;

    // Build update object - allow updating more fields
    const updateData: any = {};
    if (isApproved !== undefined) updateData.isApproved = isApproved;
    if (role !== undefined) updateData.role = role;
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (rollNo !== undefined) updateData.rollNo = rollNo;
    if (batch !== undefined) updateData.batch = batch;
    if (section !== undefined) updateData.section = section;
    if (expertise !== undefined) updateData.expertise = expertise;

    const user = await User.findByIdAndUpdate(
      new Types.ObjectId(id),
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: user,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAuth(request, ['admin']);

    await dbConnect();

    const { id } = await params;

    const result = await User.findByIdAndDelete(new Types.ObjectId(id));

    if (!result) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}