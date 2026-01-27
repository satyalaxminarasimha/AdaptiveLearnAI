import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Quiz from '@/models/Quiz';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const createdBy = searchParams.get('createdBy');
    const isActive = searchParams.get('isActive');

    let query: any = {};
    if (createdBy) query.createdBy = createdBy;
    if (isActive !== null) query.isActive = isActive === 'true';

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
    await dbConnect();

    const { title, subject, topics, questions, createdBy, dueDate } = await request.json();

    const quiz = new Quiz({
      title,
      subject,
      topics,
      questions,
      createdBy,
      dueDate: dueDate ? new Date(dueDate) : undefined,
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