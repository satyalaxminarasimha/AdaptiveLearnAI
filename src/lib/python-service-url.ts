import { NextResponse } from 'next/server';

export function getPythonServiceUrl(): string | null {
  const configured = process.env.PYTHON_SERVICE_URL || process.env.NEXT_PUBLIC_PYTHON_SERVICE_URL;
  if (configured && configured.trim().length > 0) {
    return configured.replace(/\/$/, '');
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:8000';
  }

  return null;
}

export function pythonServiceUnavailableResponse(operation: string) {
  return NextResponse.json(
    {
      error: `Python service is not configured for ${operation}`,
      fix: 'Set PYTHON_SERVICE_URL in your Vercel project to your deployed Python API base URL.',
    },
    { status: 503 }
  );
}
