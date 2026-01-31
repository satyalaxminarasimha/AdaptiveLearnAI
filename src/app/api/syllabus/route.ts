import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Syllabus from '@/models/Syllabus';
import { verifyToken } from '@/lib/auth';

// GET - Get syllabus with completion status
export async function GET(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const batch = searchParams.get('batch');
    const section = searchParams.get('section');
    const year = searchParams.get('year');
    const semester = searchParams.get('semester');

    let query: Record<string, unknown> = {};
    if (batch) query.batch = batch;
    if (section) query.section = section;
    if (year) query.year = year;
    if (semester) query.semester = semester;

    const syllabi = await Syllabus.find(query)
      .populate('updatedBy', 'name')
      .sort({ updatedAt: -1 });

    // Calculate completion percentages
    const syllabusWithStats = syllabi.map(s => {
      const subjects = s.subjects.map(subj => {
        const totalTopics = subj.topics.length;
        const completedTopics = subj.topics.filter(t => t.isCompleted).length;
        return {
          ...subj.toObject(),
          totalTopics,
          completedTopics,
          completionPercentage: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
        };
      });

      const totalAllTopics = subjects.reduce((sum, s) => sum + s.totalTopics, 0);
      const completedAllTopics = subjects.reduce((sum, s) => sum + s.completedTopics, 0);

      return {
        ...s.toObject(),
        subjects,
        overallCompletion: totalAllTopics > 0 ? Math.round((completedAllTopics / totalAllTopics) * 100) : 0,
      };
    });

    return NextResponse.json(syllabusWithStats);
  } catch (error) {
    console.error('Get syllabus error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create or update syllabus
export async function POST(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload || (payload.role !== 'professor' && payload.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { year, semester, batch, section, subjects } = body;

    // Check if syllabus exists
    let syllabus = await Syllabus.findOne({ year, semester, batch, section });

    if (syllabus) {
      // Update existing
      syllabus.subjects = subjects;
      syllabus.updatedBy = payload.userId;
      syllabus.lastUpdated = new Date();
    } else {
      // Create new
      syllabus = new Syllabus({
        year,
        semester,
        batch,
        section,
        subjects,
        updatedBy: payload.userId,
        lastUpdated: new Date(),
      });
    }

    await syllabus.save();

    return NextResponse.json({
      message: 'Syllabus saved successfully',
      syllabus,
    });
  } catch (error) {
    console.error('Save syllabus error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
