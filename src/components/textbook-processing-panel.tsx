'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
  BookOpen,
  Zap,
} from 'lucide-react';

interface ProcessingResult {
  success: boolean;
  textbook_id: string;
  textbook_name: string;
  total_chunks: number;
  valid_chunks: number;
  discarded_chunks: number;
  total_units: number;
  chunks_per_unit: Record<number, number>;
  processing_time_seconds: number;
}

export function TextbookProcessingPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const textbookInputRef = useRef<HTMLInputElement>(null);
  const syllabusInputRef = useRef<HTMLInputElement>(null);
  const textbookIdRef = useRef<HTMLInputElement>(null);
  const textbookNameRef = useRef<HTMLInputElement>(null);
  const batchRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const textbookFile = textbookInputRef.current?.files?.[0];
    const syllabusFile = syllabusInputRef.current?.files?.[0];
    const textbookId = textbookIdRef.current?.value;
    const textbookName = textbookNameRef.current?.value;
    const batch = batchRef.current?.value;
    const section = sectionRef.current?.value;
    const subject = subjectRef.current?.value;

    if (!textbookFile || !syllabusFile || !textbookId || !textbookName) {
      setError('Please fill in all required fields and select both PDF files');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please sign in again before uploading textbooks.');
      return;
    }

    setIsLoading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('textbook', textbookFile);
      formData.append('syllabus', syllabusFile);
      formData.append('textbook_id', textbookId);
      formData.append('textbook_name', textbookName);
      if (batch) formData.append('batch', batch);
      if (section) formData.append('section', section);
      if (subject) formData.append('subject', subject);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90));
      }, 1000);

      const response = await fetch('/api/ai/process-textbook', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process textbook');
      }

      const data = await response.json();
      setProgress(100);
      setResult(data.data);

      // Reset form
      textbookInputRef.current!.value = '';
      syllabusInputRef.current!.value = '';
      textbookIdRef.current!.value = '';
      textbookNameRef.current!.value = '';
      batchRef.current!.value = '';
      sectionRef.current!.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Process Textbook
          </CardTitle>
          <CardDescription>
            Upload textbook and syllabus PDFs to extract content and create searchable chunks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Textbook Metadata */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Textbook ID *</label>
                <Input
                  ref={textbookIdRef}
                  placeholder="e.g., bio_101"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Textbook Name *</label>
                <Input
                  ref={textbookNameRef}
                  placeholder="e.g., Biology 101"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Batch/Year</label>
                <Input
                  ref={batchRef}
                  placeholder="e.g., 2022"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Section</label>
                <Input
                  ref={sectionRef}
                  placeholder="e.g., A"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Subject / Course</label>
                <Input
                  ref={subjectRef}
                  placeholder="e.g., Data Structures"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* File Uploads */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Textbook PDF *</label>
                <div className="relative">
                  <input
                    ref={textbookInputRef}
                    type="file"
                    accept=".pdf"
                    required
                    disabled={isLoading}
                    className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {textbookInputRef.current?.files?.[0]?.name || 'Choose PDF'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Syllabus PDF *</label>
                <div className="relative">
                  <input
                    ref={syllabusInputRef}
                    type="file"
                    accept=".pdf"
                    required
                    disabled={isLoading}
                    className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {syllabusInputRef.current?.files?.[0]?.name || 'Choose PDF'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {isLoading && progress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processing...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Process Textbook
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="border-primary/10 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Processing Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-background p-4">
                <p className="text-sm text-muted-foreground">Total Chunks</p>
                <p className="text-2xl font-semibold">{result.total_chunks}</p>
              </div>
              <div className="rounded-lg bg-background p-4">
                <p className="text-sm text-muted-foreground">Valid Chunks</p>
                <p className="text-2xl font-semibold">{result.valid_chunks}</p>
              </div>
              <div className="rounded-lg bg-background p-4">
                <p className="text-sm text-muted-foreground">Extracted Units</p>
                <p className="text-2xl font-semibold">{result.total_units}</p>
              </div>
              <div className="rounded-lg bg-background p-4">
                <p className="text-sm text-muted-foreground">Processing Time</p>
                <p className="text-2xl font-semibold">{result.processing_time_seconds.toFixed(2)}s</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Distribution by Unit:</p>
              <div className="space-y-1">
                {Object.entries(result.chunks_per_unit).map(([unit, count]) => (
                  <div key={unit} className="flex items-center justify-between text-sm">
                    <span>Unit {unit}:</span>
                    <Badge variant="secondary">{count} chunks</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
