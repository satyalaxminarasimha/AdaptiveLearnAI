import { NextRequest, NextResponse } from 'next/server';

import { verifyToken } from '@/lib/auth';
import connectToDatabase from '@/lib/db/connect';
import { parseSyllabus } from '@/lib/ai/parseSyllabus';
import { extractText } from '@/lib/pdf/extractText';
import { extractDocxText } from '@/lib/docx/extractText';
import Syllabus from '@/models/Syllabus';

export const runtime = 'nodejs';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const PDF_MIME = 'application/pdf';
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function getUploadType(file: File): 'pdf' | 'docx' | null {
  const lowerName = file.name.toLowerCase();

  if (file.type === PDF_MIME || lowerName.endsWith('.pdf')) {
    return 'pdf';
  }

  if (file.type === DOCX_MIME || lowerName.endsWith('.docx')) {
    return 'docx';
  }

  return null;
}

function flattenTopicsForTracking(
  subjects: Array<{
    units: Array<{
      topics: Array<{ topic: string }>;
    }>;
  }>
) {
  return subjects.map((subject) => {
    const flattened = subject.units.flatMap((unit) =>
      unit.topics
        .map((topic) => topic.topic?.trim())
        .filter(Boolean)
        .map((topic) => ({
          topic,
          status: 'not-started' as const,
          isCompleted: false,
        }))
    );

    return {
      topics: flattened,
      totalTopics: flattened.length,
      completedTopics: 0,
      inProgressTopics: 0,
    };
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const uploadFile = formData.get('file');

    if (!(uploadFile instanceof File)) {
      return NextResponse.json({ error: 'PDF or DOCX file is required.' }, { status: 400 });
    }

    const uploadType = getUploadType(uploadFile);
    if (!uploadType) {
      return NextResponse.json({ error: 'Only PDF (.pdf) or Word (.docx) files are allowed.' }, { status: 400 });
    }

    if (uploadFile.size <= 0 || uploadFile.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'Invalid file size. Upload a file up to 10MB.' },
        { status: 413 }
      );
    }

    const fileBuffer = Buffer.from(await uploadFile.arrayBuffer());

    let extractedText: string;
    try {
      if (uploadType === 'pdf') {
        extractedText = await extractText(fileBuffer);
      } else {
        extractedText = await extractDocxText(fileBuffer);
      }
    } catch (error) {
      console.error('Document extraction error:', error);
      return NextResponse.json(
        { error: 'Failed to read document content. Ensure the file contains selectable text.' },
        { status: 422 }
      );
    }

    let parsed;
    try {
      parsed = await parseSyllabus(extractedText);
    } catch (error) {
      console.error('AI parsing error:', error);
      return NextResponse.json(
        { error: 'AI parsing failed for this document. Please verify content and retry.' },
        { status: 502 }
      );
    }

    await connectToDatabase();

    const trackingData = flattenTopicsForTracking(parsed.subjects);

    const mappedSubjects = parsed.subjects.map((subject, index) => ({
      code: subject.code,
      name: subject.name,
      unitsDetailed: subject.units,
      topics: trackingData[index].topics,
      units: subject.units.length,
      totalTopics: trackingData[index].totalTopics,
      completedTopics: trackingData[index].completedTopics,
      inProgressTopics: trackingData[index].inProgressTopics,
    }));

    const year = parsed.year || String(formData.get('year') || '1');
    const semester = parsed.semester || String(formData.get('semester') || '1');
    const batch = String(formData.get('batch') || 'GEN');
    const section = String(formData.get('section') || 'A');

    const syllabus = await Syllabus.findOneAndUpdate(
      { year, semester, batch, section },
      {
        $set: {
          year,
          semester,
          batch,
          section,
          subjects: mappedSubjects,
          updatedBy: payload.userId,
          lastUpdated: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );

    return NextResponse.json(
      {
        message: 'Syllabus ingested successfully.',
        syllabus,
        parsed,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Syllabus ingest error:', error);
    return NextResponse.json(
      { error: 'Internal server error while ingesting syllabus.' },
      { status: 500 }
    );
  }
}
