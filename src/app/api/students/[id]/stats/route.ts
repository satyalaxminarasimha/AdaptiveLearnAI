import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import QuizAttempt from '@/models/QuizAttempt';
import Quiz from '@/models/Quiz';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id: studentId } = await params;

    // Get all attempts by this student
    const attempts = await QuizAttempt.find({ studentId });

    // Calculate stats
    const totalQuizzesAttempted = attempts.length;
    const totalQuizzes = await Quiz.countDocuments({ isActive: true });
    const pendingQuizzes = totalQuizzes - totalQuizzesAttempted;

    // Calculate average score
    const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
    const averageScore = attempts.length > 0 ? Math.round((totalScore / attempts.length) * 100) / 100 : 0;

    // Get upcoming quizzes (active quizzes not attempted)
    const attemptedQuizIds = attempts.map(a => a.quizId.toString());
    const upcomingQuizzes = await Quiz.find({
      isActive: true,
      _id: { $nin: attemptedQuizIds }
    }).limit(5);

    return NextResponse.json({
      totalQuizzes,
      quizzesAttempted: totalQuizzesAttempted,
      pendingQuizzes,
      averageScore,
      upcomingQuizzes,
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}