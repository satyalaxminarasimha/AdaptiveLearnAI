import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

// GET - Get professor's classes
export async function GET(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (payload.role !== 'professor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const professor = await User.findById(payload.userId).select('classesTeaching');
    if (!professor) {
      return NextResponse.json({ error: 'Professor not found' }, { status: 404 });
    }

    return NextResponse.json(professor.classesTeaching || []);
  } catch (error) {
    console.error('Get professor classes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add a new class
export async function POST(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (payload.role !== 'professor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const body = await request.json();
    const { subject, batch, section } = body;

    if (!subject || !batch || !section) {
      return NextResponse.json(
        { error: 'Subject, batch, and section are required' },
        { status: 400 }
      );
    }

    const professor = await User.findById(payload.userId);
    if (!professor) {
      return NextResponse.json({ error: 'Professor not found' }, { status: 404 });
    }

    // Initialize classesTeaching if it doesn't exist
    if (!professor.classesTeaching) {
      professor.classesTeaching = [];
    }

    // Check if class already exists
    const existingClass = professor.classesTeaching.find(
      (c: { subject: string; batch: string; section: string }) => 
        c.subject === subject && c.batch === batch && c.section === section
    );

    if (existingClass) {
      return NextResponse.json(
        { error: 'This class is already added' },
        { status: 400 }
      );
    }

    professor.classesTeaching.push({ subject, batch, section });
    await professor.save();

    return NextResponse.json({
      success: true,
      classesTeaching: professor.classesTeaching,
    });
  } catch (error) {
    console.error('Add professor class error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove a class
export async function DELETE(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (payload.role !== 'professor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const body = await request.json();
    const { subject, batch, section } = body;

    const professor = await User.findById(payload.userId);
    if (!professor) {
      return NextResponse.json({ error: 'Professor not found' }, { status: 404 });
    }

    // Filter out the class to remove
    professor.classesTeaching = professor.classesTeaching?.filter(
      (c: { subject: string; batch: string; section: string }) => 
        !(c.subject === subject && c.batch === batch && c.section === section)
    ) || [];

    await professor.save();

    return NextResponse.json({
      success: true,
      classesTeaching: professor.classesTeaching,
    });
  } catch (error) {
    console.error('Remove professor class error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
