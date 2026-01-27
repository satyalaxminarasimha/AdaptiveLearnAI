import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    requireAuth(request, ['admin']);

    await dbConnect();

    const totalUsers = await User.countDocuments();
    const totalProfessors = await User.countDocuments({ role: 'professor' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const admissionRequests = await User.countDocuments({ isApproved: false });

    return NextResponse.json({
      totalUsers,
      totalProfessors,
      totalStudents,
      admissionRequests,
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}