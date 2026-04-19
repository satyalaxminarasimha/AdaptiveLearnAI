import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Quiz from '@/models/Quiz';
import Syllabus from '@/models/Syllabus';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

type DashboardClass = {
  batch: string;
  section: string;
  subject: string;
};

const normalizeBatch = (value?: string) => value?.includes(' - ') ? value.split(' - ')[0].trim() : value?.trim() || '';

export async function GET(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (payload.role !== 'professor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const professor = await User.findById(payload.userId).select('name email classesTeaching');
    if (!professor) {
      return NextResponse.json({ error: 'Professor not found' }, { status: 404 });
    }

    const availableClasses: DashboardClass[] = (professor.classesTeaching || [])
      .map((classInfo: DashboardClass) => ({
        ...classInfo,
        batch: normalizeBatch(classInfo.batch),
        section: classInfo.section,
        subject: classInfo.subject,
      }))
      .filter((classInfo: DashboardClass) => classInfo.batch && classInfo.section && classInfo.subject);

    if (availableClasses.length === 0) {
      return NextResponse.json({
        professor: {
          _id: professor._id,
          name: professor.name,
          email: professor.email,
        },
        selectedClass: null,
        availableClasses: [],
        metrics: {
          activeStudents: 0,
          quizzesCreated: 0,
          totalTopics: 0,
          topicsCovered: 0,
          topicsPending: 0,
          completionRate: 0,
        },
        recentQuizzes: [],
        syllabus: null,
      });
    }

    const { searchParams } = new URL(request.url);
    const requestedBatch = normalizeBatch(searchParams.get('batch') || undefined);
    const requestedSection = searchParams.get('section')?.trim() || '';
    const requestedSubject = searchParams.get('subject')?.trim() || '';

    const selectedClass =
      availableClasses.find(
        (classInfo) =>
          classInfo.batch === requestedBatch &&
          classInfo.section === requestedSection &&
          classInfo.subject === requestedSubject
      ) || availableClasses[0];

    if (
      requestedBatch &&
      requestedSection &&
      requestedSubject &&
      !availableClasses.some(
        (classInfo) =>
          classInfo.batch === requestedBatch &&
          classInfo.section === requestedSection &&
          classInfo.subject === requestedSubject
      )
    ) {
      return NextResponse.json({ error: 'You do not teach this class' }, { status: 403 });
    }

    const query = {
      batch: selectedClass.batch,
      section: selectedClass.section,
      subject: selectedClass.subject,
    };

    const [activeStudents, quizzesCreated, syllabus] = await Promise.all([
      User.countDocuments({
        role: 'student',
        isApproved: true,
        batch: selectedClass.batch,
        section: selectedClass.section,
      }),
      Quiz.countDocuments(query),
      Syllabus.findOne({
        batch: selectedClass.batch,
        section: selectedClass.section,
      }).sort({ updatedAt: -1 }),
    ]);

    const syllabusSubject = syllabus?.subjects?.find(
      (subject) => subject.name === selectedClass.subject
    );

    const totalTopics = syllabusSubject?.totalTopics || 0;
    const topicsCovered = syllabusSubject?.completedTopics || 0;
    const topicsPending = Math.max(0, totalTopics - topicsCovered);
    const completionRate = totalTopics > 0 ? Math.round((topicsCovered / totalTopics) * 100) : 0;

    const recentQuizzes = await Quiz.find(query)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title subject isActive dueDate totalAttempts averageScore topScore difficulty createdAt topics');

    return NextResponse.json({
      professor: {
        _id: professor._id,
        name: professor.name,
        email: professor.email,
      },
      selectedClass,
      availableClasses,
      metrics: {
        activeStudents,
        quizzesCreated,
        totalTopics,
        topicsCovered,
        topicsPending,
        completionRate,
      },
      recentQuizzes: recentQuizzes.map((quiz) => ({
        _id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        isActive: quiz.isActive,
        dueDate: quiz.dueDate,
        totalAttempts: quiz.totalAttempts || 0,
        averageScore: quiz.averageScore || 0,
        topScore: quiz.topScore || 0,
        difficulty: quiz.difficulty || 'mixed',
        topicCount: Array.isArray(quiz.topics) ? quiz.topics.length : 0,
        createdAt: quiz.createdAt,
      })),
      syllabus: syllabus
        ? {
            year: syllabus.year,
            semester: syllabus.semester,
            program: syllabus.program,
            regulation: syllabus.regulation,
            lastUpdated: syllabus.lastUpdated,
            subject: syllabusSubject
              ? {
                  name: syllabusSubject.name,
                  units: syllabusSubject.units || 0,
                  totalTopics,
                  completedTopics,
                  inProgressTopics: syllabusSubject.inProgressTopics || 0,
                }
              : null,
          }
        : null,
    });
  } catch (error) {
    console.error('Get professor dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}