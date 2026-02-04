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
    const { 
      subject, 
      subjectCode, 
      program, 
      course, 
      batch, 
      semester, 
      section, 
      year, 
      status,
      syllabusId,
      credits,
      category,
      regulation,
      topics,
      timeSlots
    } = body;

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

    // Add the class with all syllabus-linked information
    professor.classesTeaching.push({ 
      subject, 
      subjectCode: subjectCode || '',
      program: program || 'CSE(AI&ML)',
      course: course || 'B.TECH',
      batch, 
      semester: semester || '1',
      section,
      year: year || 1,
      status: status || 'active',
      syllabusId: syllabusId || null,
      credits: credits || 0,
      category: category || '',
      regulation: regulation || 'R20',
      topics: topics || [],
      timeSlots: timeSlots || [],
      addedAt: new Date()
    });
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

// PATCH - Update a class (including timeSlots)
export async function PATCH(request: NextRequest) {
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
    const { subject, batch, section, updates } = body;

    if (!subject || !batch || !section) {
      return NextResponse.json(
        { error: 'Subject, batch, and section are required to identify the class' },
        { status: 400 }
      );
    }

    const professor = await User.findById(payload.userId);
    if (!professor) {
      return NextResponse.json({ error: 'Professor not found' }, { status: 404 });
    }

    // Find and update the class
    const classIndex = professor.classesTeaching?.findIndex(
      (c: { subject: string; batch: string; section: string }) => 
        c.subject === subject && c.batch === batch && c.section === section
    );

    if (classIndex === -1 || classIndex === undefined) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Update the class with new values
    if (updates) {
      Object.keys(updates).forEach(key => {
        professor.classesTeaching[classIndex][key] = updates[key];
      });
    }

    await professor.save();

    return NextResponse.json({
      success: true,
      classesTeaching: professor.classesTeaching,
    });
  } catch (error) {
    console.error('Update professor class error:', error);
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
