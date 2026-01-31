import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Syllabus from '@/models/Syllabus';
import { verifyToken } from '@/lib/auth';

// PATCH - Mark topics as completed
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = verifyToken(request);
    if (!payload || payload.role !== 'professor') {
      return NextResponse.json({ error: 'Unauthorized - Professor only' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const body = await request.json();
    const { subjectName, topicUpdates } = body;
    // topicUpdates: [{ topic: string, isCompleted: boolean }]

    const syllabus = await Syllabus.findById(id);
    if (!syllabus) {
      return NextResponse.json({ error: 'Syllabus not found' }, { status: 404 });
    }

    // Find the subject
    const subjectIndex = syllabus.subjects.findIndex(s => s.name === subjectName);
    if (subjectIndex === -1) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    // Update topic completion status
    for (const update of topicUpdates) {
      const topicIndex = syllabus.subjects[subjectIndex].topics.findIndex(
        t => t.topic === update.topic
      );
      if (topicIndex !== -1) {
        syllabus.subjects[subjectIndex].topics[topicIndex].isCompleted = update.isCompleted;
        if (update.isCompleted) {
          syllabus.subjects[subjectIndex].topics[topicIndex].completedDate = new Date();
          syllabus.subjects[subjectIndex].topics[topicIndex].completedBy = payload.userId;
        } else {
          syllabus.subjects[subjectIndex].topics[topicIndex].completedDate = undefined;
          syllabus.subjects[subjectIndex].topics[topicIndex].completedBy = undefined;
        }
      }
    }

    // Recalculate completed topics count
    syllabus.subjects[subjectIndex].completedTopics = syllabus.subjects[subjectIndex].topics.filter(
      t => t.isCompleted
    ).length;
    syllabus.subjects[subjectIndex].totalTopics = syllabus.subjects[subjectIndex].topics.length;

    syllabus.updatedBy = payload.userId;
    syllabus.lastUpdated = new Date();

    await syllabus.save();

    return NextResponse.json({
      message: 'Syllabus updated successfully',
      syllabus,
    });
  } catch (error) {
    console.error('Update syllabus completion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Get specific syllabus
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

    const syllabus = await Syllabus.findById(id)
      .populate('updatedBy', 'name');

    if (!syllabus) {
      return NextResponse.json({ error: 'Syllabus not found' }, { status: 404 });
    }

    return NextResponse.json(syllabus);
  } catch (error) {
    console.error('Get syllabus error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
