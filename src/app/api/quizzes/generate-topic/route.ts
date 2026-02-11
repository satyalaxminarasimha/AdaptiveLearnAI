import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Quiz from '@/models/Quiz';
import { verifyToken } from '@/lib/auth';
import { generateQuizFromSyllabus } from '@/ai/flows/generate-quiz-from-syllabus';

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

    const {
      subject,
      topic,
      batch,
      section,
      semester,
      year,
      difficulty = 'medium',
      numberOfQuestions = 5,
      passPercentage = 60,
      duration = 15,
      dueDate,
      title,
    } = await request.json();

    if (!subject || !topic || !batch || !section) {
      return NextResponse.json(
        { error: 'Subject, topic, batch, and section are required' },
        { status: 400 }
      );
    }

    const existingQuiz = await Quiz.findOne({
      subject,
      batch,
      section,
      isActive: true,
      topics: topic,
    });

    if (existingQuiz) {
      return NextResponse.json(
        { error: 'A quiz for this topic already exists for this class.' },
        { status: 409 }
      );
    }

    const aiResult = await generateQuizFromSyllabus({
      syllabusTopic: topic,
      difficultyLevel: difficulty,
      numberOfQuestions,
    });

    const pointsPerQuestion = Math.max(1, Math.round(100 / numberOfQuestions));

    const questions = aiResult.quizQuestions.map((q) => {
      const correctIndex = q.options.findIndex((opt) => opt === q.correctAnswer);
      return {
        question: q.question,
        options: q.options,
        correctAnswer: correctIndex >= 0 ? correctIndex : 0,
        points: pointsPerQuestion,
        difficulty,
        topic,
      };
    });

    const quiz = new Quiz({
      title: title || `${subject} - ${topic}`,
      subject,
      topics: [topic],
      questions,
      createdBy: payload.userId,
      isActive: true,
      isAIGenerated: true,
      batch,
      section,
      year,
      semester,
      difficulty,
      passPercentage,
      duration,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    await quiz.save();

    return NextResponse.json(
      {
        success: true,
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          subject: quiz.subject,
          topics: quiz.topics,
          questionCount: quiz.questions.length,
          duration: quiz.duration,
          passPercentage: quiz.passPercentage,
          dueDate: quiz.dueDate,
          difficulty: quiz.difficulty,
          batch: quiz.batch,
          section: quiz.section,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Generate topic quiz error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz. Please try again.' },
      { status: 500 }
    );
  }
}
