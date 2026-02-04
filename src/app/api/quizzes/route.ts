import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Quiz from '@/models/Quiz';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const createdBy = searchParams.get('createdBy');
    const isActive = searchParams.get('isActive');
    const subject = searchParams.get('subject');
    const batch = searchParams.get('batch');
    const section = searchParams.get('section');

    let query: any = {};
    if (createdBy) query.createdBy = createdBy;
    if (isActive !== null && isActive !== undefined) query.isActive = isActive === 'true';
    if (subject) query.subject = subject;
    if (batch) query.batch = batch;
    if (section) query.section = section;

    const quizzes = await Quiz.find(query).populate('createdBy', 'name').sort({ createdAt: -1 });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Get quizzes error:', error);
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

    const { 
      title, 
      subject, 
      topics, 
      questions, 
      createdBy, 
      dueDate,
      batch,
      section,
      difficulty,
      passPercentage,
      duration
    } = await request.json();

    const quiz = new Quiz({
      title,
      subject,
      topics,
      questions,
      createdBy: createdBy || payload.userId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      batch,
      section,
      difficulty: difficulty || 'medium',
      passPercentage: passPercentage || 60,
      duration: duration || 30,
    });

    await quiz.save();

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error('Create quiz error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}