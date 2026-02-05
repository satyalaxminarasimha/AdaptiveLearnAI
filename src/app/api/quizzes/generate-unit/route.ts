import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Quiz from '@/models/Quiz';
import { verifyToken } from '@/lib/auth';
import { generateUnitQuiz } from '@/ai/flows/generate-unit-quiz';

export async function POST(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { 
      subject, 
      unitName, 
      unitNumber,
      topics,
      batch,
      section,
      year,
      semester,
      numberOfQuestions = 30,
      duration = 45,
      passPercentage = 60,
    } = await request.json();

    if (!subject || !unitName || !topics || topics.length === 0) {
      return NextResponse.json(
        { error: 'Subject, unit name, and topics are required' },
        { status: 400 }
      );
    }

    // Check if quiz already exists for this unit
    const existingQuiz = await Quiz.findOne({
      subject,
      unitName,
      batch,
      section,
      isActive: true,
    });

    if (existingQuiz) {
      return NextResponse.json(
        { error: 'A quiz already exists for this unit. Please deactivate it first.' },
        { status: 409 }
      );
    }

    // Extract topic names (remove UNIT X: prefix for AI)
    const topicNames = topics.map((t: string) => {
      const match = t.match(/^UNIT\s*[IVX0-9]+\s*:\s*(.+)$/i);
      return match ? match[1] : t;
    });

    console.log(`Generating AI quiz for ${subject} - ${unitName} with ${topicNames.length} topics...`);

    // Generate quiz using AI
    const aiResult = await generateUnitQuiz({
      unitName,
      subject,
      topics: topicNames,
      numberOfQuestions,
    });

    // Transform AI questions to quiz format
    const questions = aiResult.questions.map((q, index) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      topic: q.topic,
      subtopic: q.subtopic || '',
      prerequisites: q.prerequisites || [],
      difficulty: q.difficulty,
      points: q.difficulty === 'hard' ? 15 : q.difficulty === 'medium' ? 10 : 5,
    }));

    // Create the quiz
    const quiz = new Quiz({
      title: `${subject} - ${unitName} Assessment`,
      subject,
      topics,
      unitName,
      unitNumber: unitNumber || parseUnitNumber(unitName),
      questions,
      createdBy: payload.userId,
      isActive: true,
      isAIGenerated: true,
      batch,
      section,
      year,
      semester,
      difficulty: 'mixed',
      passPercentage,
      duration,
      unitSummary: aiResult.unitSummary,
      topicCoverage: aiResult.topicCoverage,
    });

    await quiz.save();

    console.log(`Quiz created successfully with ${questions.length} questions`);

    return NextResponse.json({
      success: true,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        unitName: quiz.unitName,
        questionCount: quiz.questions.length,
        duration: quiz.duration,
        unitSummary: aiResult.unitSummary,
        topicCoverage: aiResult.topicCoverage,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Generate unit quiz error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz. Please try again.' },
      { status: 500 }
    );
  }
}

// Helper function to parse unit number from unit name
function parseUnitNumber(unitName: string): number {
  const romanToNum: Record<string, number> = { 
    'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 
    'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10 
  };
  
  const match = unitName.match(/Unit\s*([IVX]+|[0-9]+)/i);
  if (match) {
    const val = match[1].toUpperCase();
    return romanToNum[val] || parseInt(val) || 0;
  }
  return 0;
}

// GET - Fetch unit quizzes for a subject
export async function GET(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const batch = searchParams.get('batch');
    const section = searchParams.get('section');
    const unitName = searchParams.get('unitName');

    const query: any = { isAIGenerated: true, isActive: true };
    if (subject) query.subject = subject;
    if (batch) query.batch = batch;
    if (section) query.section = section;
    if (unitName) query.unitName = unitName;

    const quizzes = await Quiz.find(query)
      .select('title subject unitName unitNumber questionCount duration passPercentage totalAttempts averageScore topScore createdAt')
      .sort({ unitNumber: 1, createdAt: -1 });

    // Add question count to each quiz
    const quizzesWithCount = quizzes.map(q => ({
      ...q.toObject(),
      questionCount: q.questions?.length || 0,
    }));

    return NextResponse.json(quizzesWithCount);

  } catch (error) {
    console.error('Get unit quizzes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
