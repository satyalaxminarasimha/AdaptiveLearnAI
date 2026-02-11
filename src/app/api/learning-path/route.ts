import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import QuizAttempt from '@/models/QuizAttempt';
import WeakArea from '@/models/WeakArea';
import Syllabus from '@/models/Syllabus';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { personalizeLearningPath } from '@/ai/flows/personalize-learning-path';

// GET - Get personalized learning path for a student
export async function GET(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId') || payload.userId;
    
    // Students can only view their own learning path
    if (payload.role === 'student' && studentId !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get student info
    const student = await User.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get student's quiz attempts
    const quizAttempts = await QuizAttempt.find({ studentId })
      .populate('quizId', 'title subject topics')
      .sort({ attemptedAt: -1 });

    // Get student's weak areas
    const weakAreas = await WeakArea.find({ studentId })
      .sort({ wrongAnswersCount: -1 });

    // Get relevant syllabus
    const syllabus = await Syllabus.findOne({
      batch: student.batch,
      section: student.section,
    });

    // Calculate performance metrics
    const performanceBySubject = new Map<string, {
      subject: string;
      totalAttempts: number;
      averageScore: number;
      passRate: number;
      weakTopics: string[];
      strongTopics: string[];
    }>();

    quizAttempts.forEach((attempt) => {
      const quiz = attempt.quizId as any;
      if (!quiz) return;
      
      const subject = quiz.subject;
      if (!performanceBySubject.has(subject)) {
        performanceBySubject.set(subject, {
          subject,
          totalAttempts: 0,
          averageScore: 0,
          passRate: 0,
          weakTopics: [],
          strongTopics: [],
        });
      }
      
      const stats = performanceBySubject.get(subject)!;
      stats.totalAttempts++;
      stats.averageScore = 
        (stats.averageScore * (stats.totalAttempts - 1) + attempt.percentage) / stats.totalAttempts;
      if (attempt.status === 'pass') {
        stats.passRate = ((stats.passRate * (stats.totalAttempts - 1)) + 100) / stats.totalAttempts;
      } else {
        stats.passRate = (stats.passRate * (stats.totalAttempts - 1)) / stats.totalAttempts;
      }
    });

    // Add weak topics from WeakArea collection
    weakAreas.forEach((wa) => {
      const stats = performanceBySubject.get(wa.subject);
      if (stats) {
        if (wa.status === 'critical' || wa.status === 'needs_work') {
          if (!stats.weakTopics.includes(wa.topic)) {
            stats.weakTopics.push(wa.topic);
          }
        } else if (wa.status === 'mastered') {
          if (!stats.strongTopics.includes(wa.topic)) {
            stats.strongTopics.push(wa.topic);
          }
        }
      }
    });

    const subjectPerformance = Array.from(performanceBySubject.values());

    // Build syllabus string for AI
    let syllabusText = '';
    if (syllabus) {
      syllabus.subjects.forEach((subj: any) => {
        syllabusText += `${subj.name}: `;
        subj.topics?.forEach((t: any) => {
          syllabusText += `${t.topic} (${t.isCompleted ? 'completed' : 'pending'}), `;
        });
        syllabusText += '\n';
      });
    }

    // Build quiz results for AI
    const quizResults = quizAttempts.slice(0, 10).map((attempt) => ({
      quizId: attempt.quizId?._id?.toString() || '',
      score: attempt.percentage,
      topic: (attempt.quizId as any)?.topics?.[0] || attempt.subject || 'General',
    }));

    // Generate AI learning path
    let aiLearningPath = null;
    try {
      if (quizResults.length > 0) {
        const result = await personalizeLearningPath({
          studentId: studentId,
          quizResults,
          syllabus: syllabusText || 'General curriculum',
        });
        aiLearningPath = result.learningPath;
      }
    } catch (aiError) {
      console.error('AI learning path generation failed:', aiError);
    }

    // Build recommendations based on data
    const recommendations = [];
    
    // Priority 1: Critical weak areas
    const criticalAreas = weakAreas.filter(wa => wa.status === 'critical');
    if (criticalAreas.length > 0) {
      recommendations.push({
        priority: 'high',
        type: 'weak_area',
        title: 'Critical Topics Need Attention',
        description: `Focus on these critical areas: ${criticalAreas.map(wa => wa.topic).join(', ')}`,
        topics: criticalAreas.map(wa => ({ topic: wa.topic, subject: wa.subject })),
      });
    }

    // Priority 2: Subjects with low pass rate
    subjectPerformance.forEach(perf => {
      if (perf.passRate < 60 && perf.totalAttempts >= 2) {
        recommendations.push({
          priority: 'high',
          type: 'subject_improvement',
          title: `Improve ${perf.subject}`,
          description: `Your pass rate in ${perf.subject} is ${Math.round(perf.passRate)}%. Review the basics and practice more.`,
          subject: perf.subject,
        });
      }
    });

    // Priority 3: Topics needing work
    const needsWorkAreas = weakAreas.filter(wa => wa.status === 'needs_work');
    if (needsWorkAreas.length > 0) {
      recommendations.push({
        priority: 'medium',
        type: 'practice',
        title: 'Topics to Review',
        description: `These topics need more practice: ${needsWorkAreas.slice(0, 5).map(wa => wa.topic).join(', ')}`,
        topics: needsWorkAreas.slice(0, 5).map(wa => ({ topic: wa.topic, subject: wa.subject })),
      });
    }

    // Priority 4: Celebrate mastered topics
    const masteredAreas = weakAreas.filter(wa => wa.status === 'mastered');
    if (masteredAreas.length > 0) {
      recommendations.push({
        priority: 'low',
        type: 'achievement',
        title: 'Topics Mastered',
        description: `Great progress! You've mastered: ${masteredAreas.map(wa => wa.topic).join(', ')}`,
        topics: masteredAreas.map(wa => ({ topic: wa.topic, subject: wa.subject })),
      });
    }

    return NextResponse.json({
      student: {
        _id: student._id,
        name: student.name,
        rollNo: student.rollNo,
        batch: student.batch,
        section: student.section,
      },
      subjectPerformance,
      weakAreas: weakAreas.map(wa => ({
        topic: wa.topic,
        subject: wa.subject,
        status: wa.status,
        wrongAnswersCount: wa.wrongAnswersCount,
        totalAttempts: wa.totalAttempts,
      })),
      recommendations,
      aiLearningPath,
      recentQuizzes: quizAttempts.slice(0, 5).map(a => ({
        _id: a._id,
        title: (a.quizId as any)?.title || 'Quiz',
        subject: (a.quizId as any)?.subject || a.subject,
        score: a.percentage,
        status: a.status,
        attemptedAt: a.attemptedAt,
      })),
      stats: {
        totalQuizzes: quizAttempts.length,
        averageScore: quizAttempts.length > 0 
          ? Math.round(quizAttempts.reduce((sum, a) => sum + a.percentage, 0) / quizAttempts.length)
          : 0,
        criticalAreasCount: criticalAreas.length,
        masteredTopicsCount: masteredAreas.length,
      },
    });
  } catch (error) {
    console.error('Get learning path error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
