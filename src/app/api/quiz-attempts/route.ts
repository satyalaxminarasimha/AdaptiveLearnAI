import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import QuizAttempt from '@/models/QuizAttempt';
import Quiz from '@/models/Quiz';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const quizId = searchParams.get('quizId');

    let query: Record<string, unknown> = {};
    if (studentId) query.studentId = studentId;
    if (quizId) query.quizId = quizId;

    const attempts = await QuizAttempt.find(query)
      .populate('quizId', 'title subject passPercentage')
      .populate('studentId', 'name email rollNo')
      .sort({ attemptedAt: -1 });

    // Transform data for frontend
    const transformedAttempts = attempts.map(attempt => ({
      _id: attempt._id,
      studentId: attempt.studentId,
      quizId: attempt.quizId,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      correctAnswers: Math.round((attempt.score / 100) * attempt.totalQuestions),
      status: attempt.status,
      completedAt: attempt.attemptedAt,
    }));

    return NextResponse.json(transformedAttempts);
  } catch (error) {
    console.error('Get quiz attempts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { studentId, quizId, answers, score, totalQuestions, status } = await request.json();

    const attempt = new QuizAttempt({
      studentId: studentId || payload.userId,
      quizId,
      answers,
      score,
      totalQuestions,
      status,
    });

    await attempt.save();

    // Update quiz stats
    const allAttempts = await QuizAttempt.find({ quizId });
    const totalAttempts = allAttempts.length;
    const averageScore = totalAttempts > 0 
      ? Math.round(allAttempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts)
      : 0;

    await Quiz.findByIdAndUpdate(quizId, { totalAttempts, averageScore });

    return NextResponse.json(attempt, { status: 201 });
  } catch (error) {
    console.error('Create quiz attempt error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}