import { NextResponse } from 'next/server';
import { getPythonServiceUrl, pythonServiceUnavailableResponse } from '@/lib/python-service-url';

export async function GET() {
  try {
    const pythonServiceUrl = getPythonServiceUrl();
    if (!pythonServiceUrl) {
      return pythonServiceUnavailableResponse('capabilities check');
    }

    const response = await fetch(`${pythonServiceUrl}/capabilities`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: error.detail || 'Failed to get capabilities' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
