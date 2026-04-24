import { NextRequest, NextResponse } from 'next/server';
import { getPythonServiceUrl, pythonServiceUnavailableResponse } from '@/lib/python-service-url';

export async function POST(request: NextRequest) {
  try {
    const pythonServiceUrl = getPythonServiceUrl();
    if (!pythonServiceUrl) {
      return pythonServiceUnavailableResponse('semantic search');
    }

    const { query, textbookId, k = 5, unitNumber } = await request.json();

    if (!query || !textbookId) {
      return NextResponse.json(
        { error: 'query and textbookId are required' },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      query,
      textbook_id: textbookId,
      k: k.toString(),
    });
    if (unitNumber) params.append('unit_number', unitNumber.toString());

    const response = await fetch(`${pythonServiceUrl}/search?${params.toString()}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || 'Search failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Semantic search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
