import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Syllabus from '@/models/Syllabus';
import { verifyToken } from '@/lib/auth';

// GET - Get available subjects from syllabus database
export async function GET(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const program = searchParams.get('program');
    const year = searchParams.get('year');
    const semester = searchParams.get('semester');
    const regulation = searchParams.get('regulation');

    // Build query based on provided filters
    const query: Record<string, unknown> = {};
    if (program) query.program = program;
    if (year) query.year = year;
    if (semester) query.semester = semester;
    if (regulation) query.regulation = regulation;

    // Fetch all syllabi matching the query
    const syllabi = await Syllabus.find(query).select('year semester program regulation subjects batch section');

    // Extract unique subjects with their details
    const subjectsMap = new Map<string, {
      name: string;
      code: string;
      credits: number;
      category: string;
      program: string;
      year: string;
      semester: string;
      regulation: string;
      topics: { topic: string; status: string }[];
      totalTopics: number;
      courseObjectives: string[];
      courseOutcomes: string[];
      textbooks: string[];
      references: string[];
    }>();

    syllabi.forEach((syllabus) => {
      syllabus.subjects.forEach((subject: {
        name: string;
        code?: string;
        credits?: number;
        category?: string;
        topics: { topic: string; status?: string }[];
        courseObjectives?: string[];
        courseOutcomes?: string[];
        textbooks?: string[];
        references?: string[];
      }) => {
        const key = `${subject.code || subject.name}-${syllabus.year}-${syllabus.semester}`;
        if (!subjectsMap.has(key)) {
          subjectsMap.set(key, {
            name: subject.name,
            code: subject.code || '',
            credits: subject.credits || 0,
            category: subject.category || '',
            program: syllabus.program || 'CSE(AI&ML)',
            year: syllabus.year,
            semester: syllabus.semester,
            regulation: syllabus.regulation || 'R20',
            topics: subject.topics.map((t: { topic: string; status?: string }) => ({
              topic: t.topic,
              status: t.status || 'not-started'
            })),
            totalTopics: subject.topics.length,
            courseObjectives: subject.courseObjectives || [],
            courseOutcomes: subject.courseOutcomes || [],
            textbooks: subject.textbooks || [],
            references: subject.references || [],
          });
        }
      });
    });

    // Convert map to array and sort by year, semester, then name
    const subjects = Array.from(subjectsMap.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year.localeCompare(b.year);
      if (a.semester !== b.semester) return a.semester.localeCompare(b.semester);
      return a.name.localeCompare(b.name);
    });

    // Group subjects by year and semester for easier selection
    const groupedSubjects: Record<string, typeof subjects> = {};
    subjects.forEach((subject) => {
      const key = `Year ${subject.year} - Semester ${subject.semester}`;
      if (!groupedSubjects[key]) {
        groupedSubjects[key] = [];
      }
      groupedSubjects[key].push(subject);
    });

    return NextResponse.json({
      subjects,
      groupedSubjects,
      total: subjects.length,
    });
  } catch (error) {
    console.error('Get available subjects error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
