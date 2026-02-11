import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import StudentRanking from '@/models/StudentRanking';
import QuizAttempt from '@/models/QuizAttempt';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

// GET - Get rankings
export async function GET(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'class'; // class, batch, overall
    const batch = searchParams.get('batch');
    const section = searchParams.get('section');
    const subject = searchParams.get('subject');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query: Record<string, unknown> = {};
    let sortField = 'overallRank';

    if (type === 'class' && batch && section) {
      query = { batch, section };
      sortField = 'classRank';
    } else if (type === 'batch' && batch) {
      query = { batch };
      sortField = 'batchRank';
    }

    const rankings = await StudentRanking.find(query)
      .populate('studentId', 'name email rollNo avatarUrl')
      .sort({ [sortField]: 1 })
      .limit(limit);

    // If subject-specific ranking requested, sort by subject score
    if (subject && rankings.length > 0) {
      const sortedBySubject = rankings
        .map(r => {
          const subjectScore = r.subjectScores.find((s: { subject: string }) => s.subject === subject);
          return {
            ...r.toObject(),
            subjectScore: subjectScore?.averageScore || 0,
            subjectRank: subjectScore?.rank || 0,
          };
        })
        .sort((a, b) => b.subjectScore - a.subjectScore);
      
      return NextResponse.json(sortedBySubject);
    }

    return NextResponse.json(rankings);
  } catch (error) {
    console.error('Get rankings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Recalculate rankings (admin or system)
export async function POST(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    await dbConnect();

    // Get all students
    const students = await User.find({ role: 'student', isApproved: true });

    for (const student of students) {
      // Get all quiz attempts for this student
      const attempts = await QuizAttempt.find({ studentId: student._id })
        .populate('quizId', 'subject');

      if (attempts.length === 0) continue;

      // Calculate scores
      const totalScore = attempts.reduce((sum, a) => sum + (a.percentage || 0), 0);
      const averageScore = totalScore / attempts.length;
      const quizzesPassed = attempts.filter(a => a.status === 'pass').length;

      // Group by subject
      const subjectMap: Record<string, { total: number; count: number }> = {};
      for (const attempt of attempts) {
        const subject = (attempt.quizId as unknown as { subject: string })?.subject || 'Unknown';
        if (!subjectMap[subject]) {
          subjectMap[subject] = { total: 0, count: 0 };
        }
        subjectMap[subject].total += attempt.percentage || 0;
        subjectMap[subject].count += 1;
      }

      const subjectScores = Object.entries(subjectMap).map(([subject, data]) => ({
        subject,
        totalScore: data.total,
        averageScore: data.total / data.count,
        quizzesAttempted: data.count,
        rank: 0,
      }));

      // Update or create ranking
      await StudentRanking.findOneAndUpdate(
        { studentId: student._id },
        {
          studentId: student._id,
          batch: student.batch || '',
          section: student.section || '',
          branch: student.branch || 'CSM',
          totalScore,
          averageScore,
          quizzesAttempted: attempts.length,
          quizzesPassed,
          subjectScores,
          lastActivityDate: attempts[attempts.length - 1]?.attemptedAt,
        },
        { upsert: true, new: true }
      );
    }

    // Now calculate ranks
    // Overall rank
    const allRankings = await StudentRanking.find().sort({ averageScore: -1 });
    for (let i = 0; i < allRankings.length; i++) {
      allRankings[i].overallRank = i + 1;
      await allRankings[i].save();
    }

    // Batch ranks
    const batches = [...new Set(allRankings.map(r => r.batch))];
    for (const batch of batches) {
      const batchRankings = await StudentRanking.find({ batch }).sort({ averageScore: -1 });
      for (let i = 0; i < batchRankings.length; i++) {
        batchRankings[i].batchRank = i + 1;
        await batchRankings[i].save();
      }
    }

    // Class ranks
    const classes = [...new Set(allRankings.map(r => `${r.batch}-${r.section}`))];
    for (const cls of classes) {
      const [batch, section] = cls.split('-');
      const classRankings = await StudentRanking.find({ batch, section }).sort({ averageScore: -1 });
      for (let i = 0; i < classRankings.length; i++) {
        classRankings[i].classRank = i + 1;
        await classRankings[i].save();
      }
    }

    return NextResponse.json({ message: 'Rankings recalculated successfully' });
  } catch (error) {
    console.error('Recalculate rankings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
