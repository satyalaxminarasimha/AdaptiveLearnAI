import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

// GET - Get students (filtered by batch/section for professors)
export async function GET(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only professors and admins can view students
    if (payload.role !== 'professor' && payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const batch = searchParams.get('batch');
    const section = searchParams.get('section');
    const branch = searchParams.get('branch');

    // Build query for students
    const query: Record<string, unknown> = { 
      role: 'student',
      isApproved: true 
    };
    
    if (batch) query.batch = batch;
    if (section) query.section = section;
    if (branch) query.branch = branch;

    const students = await User.find(query)
      .select('-password')
      .sort({ rollNo: 1, name: 1 });

    return NextResponse.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
