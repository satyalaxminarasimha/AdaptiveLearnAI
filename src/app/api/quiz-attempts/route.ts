import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import QuizAttempt from '@/models/QuizAttempt';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const quizId = searchParams.get('quizId');

    let query: any = {};
    if (studentId) query.studentId = studentId;
    if (quizId) query.quizId = quizId;

    const attempts = await QuizAttempt.find(query)
      .populate('quizId', 'title subject')
      .sort({ attemptedAt: -1 });

    return NextResponse.json(attempts);
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
    await dbConnect();

    const { studentId, quizId, answers, score, totalQuestions, status } = await request.json();

    const attempt = new QuizAttempt({
      studentId,
      quizId,
      answers,
      score,
      totalQuestions,
      status,
    });

    await attempt.save();

    return NextResponse.json(attempt, { status: 201 });
  } catch (error) {
    console.error('Create quiz attempt error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}