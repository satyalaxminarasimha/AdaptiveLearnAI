import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProcessedTextbook from '@/models/ProcessedTextbook';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const batch = searchParams.get('batch');

    const query: any = {};
    if (status) query.status = status;
    if (batch) query.batch = batch;

    const textbooks = await ProcessedTextbook.find(query)
      .sort({ processedAt: -1 })
      .lean();

    return NextResponse.json({
      status: 'success',
      count: textbooks.length,
      data: textbooks,
    });
  } catch (error) {
    console.error('Get processed textbooks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await request.json();

    // Save processed textbook metadata
    const textbook = await ProcessedTextbook.create({
      ...body,
      status: 'completed',
      processedAt: new Date(),
    });

    return NextResponse.json({
      status: 'success',
      data: textbook,
    });
  } catch (error) {
    console.error('Create processed textbook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
