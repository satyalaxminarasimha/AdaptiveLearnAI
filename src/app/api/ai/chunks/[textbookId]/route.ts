import { NextRequest, NextResponse } from 'next/server';
import { getPythonServiceUrl, pythonServiceUnavailableResponse } from '@/lib/python-service-url';

export async function GET(
  request: NextRequest,
  { params }: { params: { textbookId: string } }
) {
  try {
    const pythonServiceUrl = getPythonServiceUrl();
    if (!pythonServiceUrl) {
      return pythonServiceUnavailableResponse('chunk retrieval');
    }

    const { searchParams } = new URL(request.url);
    const unitNumber = searchParams.get('unitNumber');
    const skip = searchParams.get('skip') || '0';
    const limit = searchParams.get('limit') || '50';

    const queryParams = new URLSearchParams({
      skip,
      limit,
    });
    if (unitNumber) queryParams.append('unit_number', unitNumber);

    const response = await fetch(
      `${pythonServiceUrl}/chunks/${params.textbookId}?${queryParams.toString()}`
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || 'Failed to get chunks' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Get chunks error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
