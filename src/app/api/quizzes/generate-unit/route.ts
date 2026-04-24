import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Quiz from '@/models/Quiz';
import Syllabus from '@/models/Syllabus';
import ProcessedTextbook from '@/models/ProcessedTextbook';
import { verifyToken } from '@/lib/auth';
import { generateUnitQuiz } from '@/ai/flows/generate-unit-quiz';
import { buildKnowledgeContext, parseUnitNumber } from '@/lib/knowledge-context';

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

    const normalizedBatch = batch?.includes(' - ') ? batch.split(' - ')[0].trim() : batch;
    const resolvedUnitNumber = unitNumber || parseUnitNumber(unitName) || undefined;

    const knowledgeContext = await buildKnowledgeContext(request.nextUrl.origin, {
      batch: normalizedBatch,
      section,
      subject,
      year: year?.toString(),
      semester: semester?.toString(),
      unitName,
      unitNumber: resolvedUnitNumber,
      topics,
      question: `${subject} ${unitName} ${topics.join(' ')}`,
      limit: 6,
    });

    const syllabus = await Syllabus.findOne({
      batch: normalizedBatch,
      section,
      year: year?.toString(),
      semester: semester?.toString(),
    }).sort({ updatedAt: -1 });

    const matchingTextbook = await ProcessedTextbook.findOne({
      batch: normalizedBatch,
      section,
      subject,
      status: 'completed',
    }).sort({ processedAt: -1, updatedAt: -1 });

    // Check if quiz already exists for this unit
    const existingQuiz = await Quiz.findOne({
      subject,
      unitName,
      batch: normalizedBatch,
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

    const syllabusSubject = syllabus?.subjects?.find(
      (currentSubject: { name: string; code?: string; unitsDetailed?: Array<{ unitNumber: string; topics?: Array<{ topic: string }> }> }) =>
        currentSubject.name === subject || currentSubject.code === subject
    );

    const syllabusTopics = syllabusSubject?.unitsDetailed?.flatMap((unit) =>
      (unit.topics || []).map((topic) => topic.topic).filter(Boolean)
    ) || [];

    const effectiveTopics = topicNames.length > 0 ? topicNames : syllabusTopics;
    const referenceContext = [
      knowledgeContext.syllabusSummary,
      knowledgeContext.textbookContext,
    ].filter(Boolean).join('\n\n');

    console.log(`Generating AI quiz for ${subject} - ${unitName} with ${effectiveTopics.length} topics...`);

    // Generate quiz using AI
    let aiResult;
    try {
      aiResult = await generateUnitQuiz({
        unitName,
        subject,
        topics: effectiveTopics,
        numberOfQuestions,
        referenceContext,
      });
    } catch (aiError: any) {
      console.error('AI generation error:', aiError);
      const msg = aiError?.message || String(aiError);
      if (msg.includes('API key expired') || msg.includes('API_KEY_INVALID')) {
        return NextResponse.json(
          { error: 'Google AI API key has expired. Please renew the GOOGLE_API_KEY in your .env.local file.' },
          { status: 503 }
        );
      }
      if (msg.includes('quota') || msg.includes('RATE_LIMIT')) {
        return NextResponse.json(
          { error: 'AI API rate limit exceeded. Please wait a moment and try again.' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `AI quiz generation failed: ${msg.slice(0, 200)}` },
        { status: 502 }
      );
    }

    if (!aiResult?.questions?.length) {
      return NextResponse.json(
        { error: 'AI returned no questions. Please try a different topic or difficulty.' },
        { status: 422 }
      );
    }

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
      unitNumber: resolvedUnitNumber || parseUnitNumber(unitName),
      sourceSyllabusId: knowledgeContext.syllabusId || syllabus?._id,
      sourceTextbookId: knowledgeContext.textbookId || matchingTextbook?.textbookId,
      knowledgeContext: referenceContext,
      questions,
      createdBy: payload.userId,
      isActive: true,
      isAIGenerated: true,
      batch: normalizedBatch,
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
