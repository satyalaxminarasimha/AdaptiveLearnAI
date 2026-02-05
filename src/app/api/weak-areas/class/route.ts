import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WeakArea from '@/models/WeakArea';
import User from '@/models/User';
import QuizAttempt from '@/models/QuizAttempt';
import { verifyToken } from '@/lib/auth';

// GET - Get aggregated weak areas for a class (for professors)
export async function GET(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only professors and admins can access this
    if (payload.role === 'student') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const batch = searchParams.get('batch');
    const section = searchParams.get('section');
    const subject = searchParams.get('subject');

    // Get students in this class
    const studentQuery: any = { role: 'student' };
    if (batch) studentQuery.batch = batch;
    if (section) studentQuery.section = section;

    const students = await User.find(studentQuery).select('_id name email rollNo');
    const studentIds = students.map(s => s._id);

    // Get weak areas for these students
    const weakAreaQuery: any = { studentId: { $in: studentIds } };
    if (subject) weakAreaQuery.subject = subject;

    const weakAreas = await WeakArea.find(weakAreaQuery)
      .populate('studentId', 'name email rollNo')
      .sort({ wrongAnswersCount: -1 });

    // Aggregate by topic
    const topicAggregation = new Map<string, {
      topic: string;
      subject: string;
      students: Array<{ name: string; email: string; severity: string; accuracy: number }>;
      subtopics: Set<string>;
      prerequisites: Set<string>;
      totalStudents: number;
      criticalCount: number;
      needsWorkCount: number;
    }>();

    weakAreas.forEach(wa => {
      const key = `${wa.subject}:${wa.topic}`;
      if (!topicAggregation.has(key)) {
        topicAggregation.set(key, {
          topic: wa.topic,
          subject: wa.subject,
          students: [],
          subtopics: new Set(),
          prerequisites: new Set(),
          totalStudents: 0,
          criticalCount: 0,
          needsWorkCount: 0,
        });
      }

      const agg = topicAggregation.get(key)!;
      agg.students.push({
        name: (wa.studentId as any).name,
        email: (wa.studentId as any).email,
        severity: wa.status,
        accuracy: wa.totalAttempts > 0 
          ? Math.round(((wa.totalAttempts - wa.wrongAnswersCount) / wa.totalAttempts) * 100)
          : 0,
      });
      agg.totalStudents++;
      if (wa.status === 'critical') agg.criticalCount++;
      if (wa.status === 'needs_work') agg.needsWorkCount++;
      wa.subtopics?.forEach(s => agg.subtopics.add(s));
      wa.prerequisites?.forEach(p => agg.prerequisites.add(p));
    });

    // Convert to array and sort by total students struggling
    const aggregatedTopics = Array.from(topicAggregation.values())
      .map(t => ({
        ...t,
        subtopics: Array.from(t.subtopics),
        prerequisites: Array.from(t.prerequisites),
      }))
      .sort((a, b) => b.totalStudents - a.totalStudents);

    // Get recent quiz attempts for performance trends
    const recentAttempts = await QuizAttempt.find({
      studentId: { $in: studentIds },
      ...(subject && { subject }),
    })
      .populate('studentId', 'name email rollNo')
      .sort({ attemptedAt: -1 })
      .limit(50);

    // Calculate class-wide statistics
    const stats = {
      totalStudents: students.length,
      studentsWithWeakAreas: new Set(weakAreas.map(wa => (wa.studentId as any)._id.toString())).size,
      criticalTopicsCount: aggregatedTopics.filter(t => t.criticalCount > 0).length,
      averageWeakAreasPerStudent: weakAreas.length / students.length || 0,
      mostProblematicTopics: aggregatedTopics.slice(0, 5),
    };

    // Get per-student summary
    const studentSummaries = students.map(student => {
      const studentWeakAreas = weakAreas.filter(
        wa => (wa.studentId as any)._id.toString() === student._id.toString()
      );
      const studentAttempts = recentAttempts.filter(
        a => (a.studentId as any)._id.toString() === student._id.toString()
      );
      
      return {
        student: {
          _id: student._id,
          name: student.name,
          email: student.email,
          rollNo: student.rollNo,
        },
        weakAreasCount: studentWeakAreas.length,
        criticalCount: studentWeakAreas.filter(wa => wa.status === 'critical').length,
        recentAttempts: studentAttempts.length,
        averageScore: studentAttempts.length > 0
          ? Math.round(studentAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / studentAttempts.length)
          : null,
        weakTopics: studentWeakAreas.map(wa => ({
          topic: wa.topic,
          subject: wa.subject,
          status: wa.status,
        })),
      };
    }).filter(s => s.weakAreasCount > 0)
      .sort((a, b) => b.criticalCount - a.criticalCount || b.weakAreasCount - a.weakAreasCount);

    return NextResponse.json({
      aggregatedTopics,
      studentSummaries,
      stats,
      recentAttempts: recentAttempts.slice(0, 20).map(a => ({
        studentName: (a.studentId as any)?.name,
        subject: a.subject,
        unitName: a.unitName,
        percentage: a.percentage,
        status: a.status,
        attemptedAt: a.attemptedAt,
      })),
    });

  } catch (error) {
    console.error('Get class weak areas error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
