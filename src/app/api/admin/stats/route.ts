import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

// Helper function to format relative time
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export async function GET(request: NextRequest) {
  try {
    requireAuth(request, ['admin']);

    await dbConnect();

    const totalUsers = await User.countDocuments();
    const totalProfessors = await User.countDocuments({ role: 'professor' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const admissionRequests = await User.countDocuments({ isApproved: false });

    // Fetch recent activity - latest 10 user registrations
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email role isApproved createdAt')
      .lean();

    const recentActivity = recentUsers.map((user, index) => {
      const roleLabel = user.role === 'professor' ? 'Professor' : user.role === 'student' ? 'Student' : 'Admin';
      return {
        id: user._id?.toString() || `activity-${index}`,
        description: `${roleLabel} ${user.name} (${user.email}) has ${user.isApproved ? 'been approved' : 'requested an account'}.`,
        time: getRelativeTime(new Date(user.createdAt)),
        status: user.isApproved ? 'approved' : 'pending',
        type: user.role,
      };
    });

    return NextResponse.json({
      totalUsers,
      totalProfessors,
      totalStudents,
      admissionRequests,
      recentActivity,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Get admin stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}