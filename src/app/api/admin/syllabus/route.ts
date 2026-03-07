import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Syllabus from '@/models/Syllabus';
import { verifyToken } from '@/lib/auth';

// GET - Get all syllabus data grouped by year/semester for admin view
export async function GET(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Allow admin, professor to view all syllabus
    if (payload.role !== 'admin' && payload.role !== 'professor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    // Get one syllabus record per year/semester combination (they all have same subjects)
    const syllabi = await Syllabus.aggregate([
      {
        $group: {
          _id: { year: '$year', semester: '$semester' },
          subjects: { $first: '$subjects' },
          batch: { $first: '$batch' },
          section: { $first: '$section' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.semester': 1 },
      },
    ]);

    // Transform to grouped format: { "1st Year": { "1st Semester": [...subjects], "2nd Semester": [...] }, ... }
    const yearNames: Record<string, string> = {
      '1': '1st Year',
      '2': '2nd Year',
      '3': '3rd Year',
      '4': '4th Year',
    };

    const semesterNames: Record<string, string> = {
      '1': '1st Semester',
      '2': '2nd Semester',
    };

    const grouped: Record<string, Record<string, Array<{ name: string; code: string; credits: number; topics: string[] }>>> = {};

    for (const item of syllabi) {
      const yearKey = yearNames[item._id.year] || `Year ${item._id.year}`;
      const semKey = semesterNames[item._id.semester] || `Semester ${item._id.semester}`;

      // Calculate actual semester number (1-8)
      const actualSemester = (parseInt(item._id.year) - 1) * 2 + parseInt(item._id.semester);
      const semesterLabel = `${actualSemester}${actualSemester === 1 ? 'st' : actualSemester === 2 ? 'nd' : actualSemester === 3 ? 'rd' : 'th'} Semester`;

      if (!grouped[yearKey]) {
        grouped[yearKey] = {};
      }

      // Extract topic names from TopicCompletion objects
      grouped[yearKey][semesterLabel] = item.subjects.map((subj: {
        name: string;
        code: string;
        credits: number;
        topics: Array<{ topic: string; isCompleted: boolean }>;
      }) => ({
        name: subj.name,
        code: subj.code,
        credits: subj.credits,
        topics: subj.topics.map((t: { topic: string }) => t.topic).filter(Boolean),
      }));
    }

    return NextResponse.json(grouped);
  } catch (error) {
    console.error('Get admin syllabus error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
