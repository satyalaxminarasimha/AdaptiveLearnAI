import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import ProcessedTextbook from '@/models/ProcessedTextbook';
import Syllabus from '@/models/Syllabus';
import { getPythonServiceUrl, pythonServiceUnavailableResponse } from '@/lib/python-service-url';

export async function POST(request: NextRequest) {
  try {
    const pythonServiceUrl = getPythonServiceUrl();
    if (!pythonServiceUrl) {
      return pythonServiceUnavailableResponse('textbook processing');
    }

    const payload = verifyToken(request);
    if (!payload || (payload.role !== 'admin' && payload.role !== 'professor')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const textbookFile = formData.get('textbook');
    const syllabusFile = formData.get('syllabus');
    const textbookId = String(formData.get('textbook_id') || formData.get('textbookId') || '');
    const textbookName = String(formData.get('textbook_name') || formData.get('textbookName') || textbookId || 'Processed Textbook');
    const batch = String(formData.get('batch') || '').trim();
    const section = String(formData.get('section') || '').trim();
    const subject = String(formData.get('subject') || '').trim();

    if (!(textbookFile instanceof File) || !(syllabusFile instanceof File)) {
      return NextResponse.json({ error: 'Textbook and syllabus files are required' }, { status: 400 });
    }

    if (!textbookId) {
      return NextResponse.json({ error: 'textbook_id is required' }, { status: 400 });
    }

    // Forward to Python service
    let response: Response;
    try {
      response = await fetch(`${pythonServiceUrl}/process`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type - let browser set it with boundary
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'fetch failed';
      return NextResponse.json(
        {
          error: 'Python textbook service is not reachable',
          details: message,
          serviceUrl: pythonServiceUrl,
          fix: 'Start python service with: cd python-services/quiz_platform && venv\\Scripts\\activate && python -m uvicorn api:app --reload --host 127.0.0.1 --port 8000',
        },
        { status: 503 }
      );
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: error.detail || 'Failed to process textbook' },
        { status: response.status }
      );
    }

    const data = await response.json();

    await dbConnect();

    const syllabus = await Syllabus.findOne({
      ...(batch ? { batch } : {}),
      ...(section ? { section } : {}),
      ...(subject ? { 'subjects.name': subject } : {}),
    }).sort({ updatedAt: -1 }).lean();

    const extractedUnits = Array.isArray(data?.extracted_units)
      ? data.extracted_units
      : Array.isArray(data?.extractedUnits)
        ? data.extractedUnits
        : [];

    const sourceFileName = textbookFile instanceof File ? textbookFile.name : undefined;
    const filePath = data?.file_path || data?.filePath || `uploads/${textbookId}/${sourceFileName || textbookName}`;

    const storedTextbook = await ProcessedTextbook.findOneAndUpdate(
      { textbookId },
      {
        $set: {
          textbookId,
          name: textbookName,
          batch: batch || undefined,
          section: section || undefined,
          subject: subject || syllabus?.subjects?.find((item: any) => item.name === subject)?.name || undefined,
          syllabusId: syllabus?._id || undefined,
          filePath,
          sourceFileName,
          totalChunks: Number(data?.total_chunks ?? data?.totalChunks ?? 0),
          validChunks: Number(data?.valid_chunks ?? data?.validChunks ?? 0),
          processedAt: new Date(),
          extractedUnits: extractedUnits.map((unit: any) => ({
            unitNumber: Number(unit.unitNumber ?? unit.unit_number ?? 0),
            unitTitle: String(unit.unitTitle ?? unit.unit_title ?? unit.title ?? `Unit ${unit.unitNumber ?? ''}`),
            topicCount: Number(unit.topicCount ?? unit.topic_count ?? 0),
            chunkCount: Number(unit.chunkCount ?? unit.chunk_count ?? 0),
          })),
          processingStats: {
            totalTime: Number(data?.processing_time_seconds ?? data?.processingTimeSeconds ?? 0),
            extractionQuality: Number(data?.extraction_quality ?? data?.extractionQuality ?? 0),
            mappingAccuracy: Number(data?.mapping_accuracy ?? data?.mappingAccuracy ?? 0),
          },
          status: 'completed',
          errorMessage: undefined,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );
    
    return NextResponse.json({
      data,
      metadata: storedTextbook,
    });
  } catch (error) {
    console.error('Process textbook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const pythonServiceUrl = getPythonServiceUrl();
    if (!pythonServiceUrl) {
      return pythonServiceUnavailableResponse('textbook listing');
    }

    const { searchParams } = new URL(request.url);
    const batch = searchParams.get('batch');
    const section = searchParams.get('section');

    let url = `${pythonServiceUrl}/textbooks`;
    if (batch || section) {
      const params = new URLSearchParams();
      if (batch) params.append('batch', batch);
      if (section) params.append('section', section);
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('List textbooks error:', error);
    return NextResponse.json(
      { error: 'Failed to list textbooks' },
      { status: 500 }
    );
  }
}
