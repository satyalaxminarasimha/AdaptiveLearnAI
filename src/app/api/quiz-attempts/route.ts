import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import QuizAttempt from '@/models/QuizAttempt';
import Quiz from '@/models/Quiz';
import WeakArea from '@/models/WeakArea';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { analyzeQuizPerformance } from '@/ai/flows/analyze-quiz-performance';

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
      .populate('quizId', 'title subject passPercentage unitName')
      .populate('studentId', 'name email rollNo')
      .sort({ attemptedAt: -1 });

    // Transform data for frontend
    const transformedAttempts = attempts.map(attempt => ({
      _id: attempt._id,
      studentId: attempt.studentId,
      quizId: attempt.quizId,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentage: attempt.percentage,
      correctAnswers: Math.round((attempt.score / attempt.totalQuestions) * attempt.totalQuestions),
      status: attempt.status,
      rank: attempt.rank,
      performanceAnalysis: attempt.performanceAnalysis,
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

    const { quizId, answers, timeTaken } = await request.json();

    // Fetch the quiz with questions
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Get student info
    const student = await User.findById(payload.userId);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Check if already attempted
    const existingAttempt = await QuizAttempt.findOne({
      studentId: payload.userId,
      quizId,
    });
    if (existingAttempt) {
      return NextResponse.json(
        { error: 'You have already attempted this quiz' },
        { status: 400 }
      );
    }

    // Calculate score and build detailed results
    let score = 0;
    const questionResults = quiz.questions.map((q: any, index: number) => {
      const selectedAnswer = answers[index] ?? -1;
      const isCorrect = selectedAnswer === q.correctAnswer;
      if (isCorrect) score++;

      return {
        questionIndex: index,
        question: q.question,
        topic: q.topic || 'General',
        subtopic: q.subtopic || '',
        prerequisites: q.prerequisites || [],
        difficulty: q.difficulty || 'medium',
        selectedAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        points: isCorrect ? (q.points || 10) : 0,
      };
    });

    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    const status = percentage >= (quiz.passPercentage || 60) ? 'pass' : 'fail';

    // Run AI analysis
    let performanceAnalysis = null;
    try {
      console.log('Running AI performance analysis...');
      performanceAnalysis = await analyzeQuizPerformance({
        studentName: student.name,
        subject: quiz.subject,
        unitName: quiz.unitName || 'General',
        totalQuestions,
        score,
        questionResults: questionResults.map(qr => ({
          question: qr.question,
          topic: qr.topic,
          subtopic: qr.subtopic,
          prerequisites: qr.prerequisites,
          difficulty: qr.difficulty,
          isCorrect: qr.isCorrect,
          selectedOption: qr.selectedAnswer,
          correctOption: qr.correctAnswer,
        })),
      });
      console.log('AI analysis complete');
    } catch (aiError) {
      console.error('AI analysis failed:', aiError);
      // Continue without AI analysis
    }

    // Create the attempt
    const attempt = new QuizAttempt({
      studentId: payload.userId,
      quizId,
      answers,
      questionResults,
      score,
      totalQuestions,
      percentage,
      status,
      timeTaken,
      unitName: quiz.unitName,
      subject: quiz.subject,
      performanceAnalysis,
      attemptedAt: new Date(),
      analyzedAt: performanceAnalysis ? new Date() : undefined,
    });

    await attempt.save();

    // Update quiz stats
    const allAttempts = await QuizAttempt.find({ quizId });
    const totalAttempts = allAttempts.length;
    const scores = allAttempts.map(a => a.percentage);
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalAttempts);
    const topScore = Math.max(...scores);

    await Quiz.findByIdAndUpdate(quizId, { totalAttempts, averageScore, topScore });

    // Calculate and update rankings for this quiz
    const rankedAttempts = await QuizAttempt.find({ quizId })
      .sort({ percentage: -1, timeTaken: 1 });
    
    for (let i = 0; i < rankedAttempts.length; i++) {
      await QuizAttempt.findByIdAndUpdate(rankedAttempts[i]._id, { rank: i + 1 });
    }

    // Get updated rank for this attempt
    const updatedAttempt = await QuizAttempt.findById(attempt._id);

    // Save weak areas to database for teacher dashboard
    if (performanceAnalysis?.weakAreas?.length > 0) {
      for (const weakArea of performanceAnalysis.weakAreas) {
        await WeakArea.findOneAndUpdate(
          { studentId: payload.userId, subject: quiz.subject, topic: weakArea.topic },
          {
            $set: {
              subtopics: weakArea.subtopics,
              prerequisites: weakArea.prerequisites,
              status: weakArea.severity === 'critical' ? 'critical' : 'needs_work',
              lastAttemptDate: new Date(),
            },
            $inc: { wrongAnswersCount: 1, totalAttempts: 1 },
            $push: { quizAttempts: attempt._id },
          },
          { upsert: true, new: true }
        );
      }
    }

    return NextResponse.json({
      _id: attempt._id,
      score,
      totalQuestions,
      percentage,
      status,
      rank: updatedAttempt?.rank,
      performanceAnalysis,
      timeTaken,
    }, { status: 201 });

  } catch (error) {
    console.error('Create quiz attempt error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}