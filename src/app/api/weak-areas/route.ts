import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WeakArea from '@/models/WeakArea';
import { verifyToken } from '@/lib/auth';

// GET - Get weak areas for a student
export async function GET(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId') || payload.userId;
    const subject = searchParams.get('subject');
    const status = searchParams.get('status');

    // Professors and admins can view any student's weak areas
    if (payload.role === 'student' && studentId !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let query: Record<string, unknown> = { studentId };
    
    if (subject) {
      query.subject = subject;
    }
    if (status) {
      query.status = status;
    }

    const weakAreas = await WeakArea.find(query)
      .sort({ wrongAnswersCount: -1, lastAttemptDate: -1 });

    // Group by subject
    const groupedBySubject = weakAreas.reduce((acc, area) => {
      if (!acc[area.subject]) {
        acc[area.subject] = [];
      }
      acc[area.subject].push(area);
      return acc;
    }, {} as Record<string, typeof weakAreas>);

    // Calculate summary stats
    const summary = {
      totalWeakAreas: weakAreas.length,
      criticalCount: weakAreas.filter(a => a.status === 'critical').length,
      needsWorkCount: weakAreas.filter(a => a.status === 'needs_work').length,
      improvingCount: weakAreas.filter(a => a.status === 'improving').length,
      masteredCount: weakAreas.filter(a => a.status === 'mastered').length,
    };

    return NextResponse.json({
      weakAreas,
      groupedBySubject,
      summary,
    });
  } catch (error) {
    console.error('Get weak areas error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add or update a weak area (usually called after quiz attempt)
export async function POST(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { studentId, subject, topic, subtopics, prerequisites, quizAttemptId, wrongCount, totalCount } = body;

    // Find existing weak area or create new
    let weakArea = await WeakArea.findOne({ studentId, subject, topic });

    if (weakArea) {
      // Update existing
      weakArea.wrongAnswersCount += wrongCount;
      weakArea.totalAttempts += totalCount;
      weakArea.lastAttemptDate = new Date();
      if (quizAttemptId) {
        weakArea.quizAttempts.push(quizAttemptId);
      }
      
      // Calculate improvement score based on recent attempts
      const recentAccuracy = ((totalCount - wrongCount) / totalCount) * 100;
      weakArea.improvementScore = Math.round((weakArea.improvementScore + recentAccuracy) / 2);
      
      // Update status based on improvement
      if (weakArea.improvementScore >= 80) {
        weakArea.status = 'mastered';
      } else if (weakArea.improvementScore >= 60) {
        weakArea.status = 'improving';
      } else if (weakArea.improvementScore >= 40) {
        weakArea.status = 'needs_work';
      } else {
        weakArea.status = 'critical';
      }
    } else {
      // Create new
      weakArea = new WeakArea({
        studentId,
        subject,
        topic,
        subtopics: subtopics || [],
        prerequisites: prerequisites || [],
        wrongAnswersCount: wrongCount,
        totalAttempts: totalCount,
        lastAttemptDate: new Date(),
        improvementScore: ((totalCount - wrongCount) / totalCount) * 100,
        status: wrongCount > totalCount / 2 ? 'critical' : 'needs_work',
        quizAttempts: quizAttemptId ? [quizAttemptId] : [],
      });
    }

    await weakArea.save();

    return NextResponse.json({
      message: 'Weak area updated',
      weakArea,
    });
  } catch (error) {
    console.error('Update weak area error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
