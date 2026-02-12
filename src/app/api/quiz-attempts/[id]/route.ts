import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import QuizAttempt from '@/models/QuizAttempt';
import Quiz from '@/models/Quiz';
import { verifyToken } from '@/lib/auth';
import { explainQuizQuestion, type ExplainQuizQuestionInput } from '@/ai/flows/explain-quiz-question';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const attemptId = params.id;

    // Fetch the quiz attempt
    const attempt = await QuizAttempt.findById(attemptId)
      .populate('quizId')
      .populate('studentId', 'name email');

    if (!attempt) {
      return NextResponse.json({ error: 'Quiz attempt not found' }, { status: 404 });
    }

    // Verify student owns this attempt
    if (attempt.studentId._id.toString() !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch the full quiz with all questions and options
    const quiz = await Quiz.findById(attempt.quizId);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Combine attempt with quiz full details
    const detailedAttempt = {
      _id: attempt._id,
      studentId: attempt.studentId,
      quizId: attempt.quizId,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentage: attempt.percentage,
      status: attempt.status,
      timeTaken: attempt.timeTaken,
      attemptedAt: attempt.attemptedAt,
      questions: quiz.questions.map((q: any, index: number) => {
        const questionResult = attempt.questionResults.find((qr: any) => qr.questionIndex === index);
        return {
          questionIndex: index,
          question: q.question,
          options: q.options,
          topic: q.topic || 'General',
          subtopic: q.subtopic,
          difficulty: q.difficulty || 'medium',
          correctAnswer: q.correctAnswer,
          selectedAnswer: questionResult?.selectedAnswer ?? -1,
          isCorrect: questionResult?.isCorrect ?? false,
          points: questionResult?.points ?? 0,
          explanation: q.explanation, // Existing explanation if available
        };
      }),
    };

    return NextResponse.json(detailedAttempt);
  } catch (error) {
    console.error('Get attempt details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { questionIndex } = await request.json();

    if (questionIndex === undefined || questionIndex === null) {
      return NextResponse.json(
        { error: 'questionIndex is required' },
        { status: 400 }
      );
    }

    const attemptId = params.id;

    // Fetch the quiz attempt
    const attempt = await QuizAttempt.findById(attemptId)
      .populate('quizId')
      .populate('studentId', 'name email');

    if (!attempt) {
      return NextResponse.json({ error: 'Quiz attempt not found' }, { status: 404 });
    }

    // Verify student owns this attempt
    if (attempt.studentId._id.toString() !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch the full quiz
    const quiz = await Quiz.findById(attempt.quizId);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Get the specific question
    if (questionIndex < 0 || questionIndex >= quiz.questions.length) {
      return NextResponse.json(
        { error: 'Question index out of range' },
        { status: 400 }
      );
    }

    const question = quiz.questions[questionIndex];
    const questionResult = attempt.questionResults.find(
      (qr: any) => qr.questionIndex === questionIndex
    );

    // Generate AI explanation
    const explanationInput: ExplainQuizQuestionInput = {
      question: question.question,
      options: question.options,
      selectedAnswer: questionResult?.selectedAnswer ?? -1,
      correctAnswer: question.correctAnswer,
      topic: question.topic || 'General',
      subtopic: question.subtopic,
      difficulty: question.difficulty || 'medium',
      isCorrect: questionResult?.isCorrect ?? false,
    };

    console.log('Generating AI explanation for question...');
    const explanation = await explainQuizQuestion(explanationInput);
    console.log('AI explanation generated');

    return NextResponse.json({
      questionIndex,
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      selectedAnswer: questionResult?.selectedAnswer ?? -1,
      isCorrect: questionResult?.isCorrect ?? false,
      topic: question.topic || 'General',
      explanation,
    });
  } catch (error) {
    console.error('Generate explanation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate explanation. Please try again.' },
      { status: 500 }
    );
  }
}
