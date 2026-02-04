import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

// GET - Get students (filtered by batch/section for professors based on their classes)
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
    
    // For professors, only show students from classes they teach
    if (payload.role === 'professor') {
      const professor = await User.findById(payload.userId).select('classesTeaching');
      
      if (professor?.classesTeaching && professor.classesTeaching.length > 0) {
        // If specific batch/section requested, verify professor teaches that class
        if (batch && section) {
          const teachesClass = professor.classesTeaching.some(
            (c: { batch: string; section: string }) => c.batch === batch && c.section === section
          );
          if (!teachesClass) {
            return NextResponse.json({ error: 'You do not teach this class' }, { status: 403 });
          }
          query.batch = batch;
          query.section = section;
        } else {
          // Return students from all classes the professor teaches
          const classFilters = professor.classesTeaching.map((c: { batch: string; section: string }) => ({
            batch: c.batch,
            section: c.section
          }));
          query.$or = classFilters;
        }
      } else {
        // Professor has no classes assigned, return empty
        return NextResponse.json([]);
      }
    } else {
      // Admin can filter by any batch/section
      if (batch) query.batch = batch;
      if (section) query.section = section;
    }
    
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
