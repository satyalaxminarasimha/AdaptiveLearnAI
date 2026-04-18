'use client';

import { ChangeEvent, DragEvent, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, FileUp, Loader2, UploadCloud, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type ParsedTopic = {
  topic: string;
  subtopics: string[];
};

type ParsedUnit = {
  unitNumber: string;
  topics: ParsedTopic[];
};

type ParsedSubject = {
  code: string;
  name: string;
  units: ParsedUnit[];
};

type ParsedSyllabus = {
  year: string;
  semester: string;
  subjects: ParsedSubject[];
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const PDF_MIME = 'application/pdf';
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const isAllowedFile = (file: File) => {
  const lowerName = file.name.toLowerCase();
  return (
    file.type === PDF_MIME ||
    file.type === DOCX_MIME ||
    lowerName.endsWith('.pdf') ||
    lowerName.endsWith('.docx')
  );
};

export default function AdminSyllabusIngestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [parsedSyllabus, setParsedSyllabus] = useState<ParsedSyllabus | null>(null);

  const fileLabel = useMemo(() => {
    if (!file) return 'No file selected';
    return `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
  }, [file]);

  const validateDocument = (nextFile: File) => {
    if (!isAllowedFile(nextFile)) {
      throw new Error('Please upload a valid PDF (.pdf) or Word (.docx) file.');
    }
    if (nextFile.size <= 0 || nextFile.size > MAX_FILE_SIZE) {
      throw new Error('File size must be between 1 byte and 10 MB.');
    }
  };

  const handleFileSelection = (nextFile: File | null) => {
    if (!nextFile) return;
    try {
      validateDocument(nextFile);
      setFile(nextFile);
      setError(null);
      setSuccess(null);
    } catch (err) {
      setFile(null);
      setParsedSyllabus(null);
      setSuccess(null);
      setError(err instanceof Error ? err.message : 'Invalid file.');
    }
  };

  const onInputFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(event.target.files?.[0] ?? null);
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileSelection(event.dataTransfer.files?.[0] ?? null);
  };

  const onDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Select a PDF or DOCX file before ingesting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Admin token not found. Please login again.');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/syllabus/ingest', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to ingest syllabus.');
      }

      setParsedSyllabus(data.parsed as ParsedSyllabus);
      setSuccess(data.message || 'Syllabus ingested successfully.');
    } catch (err) {
      setParsedSyllabus(null);
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Ingest Knowledge (PDF/DOCX to Syllabus)</CardTitle>
          <CardDescription>
            Upload a syllabus PDF or Word document and convert it into Year/Semester/Subjects/Units/Topics structure.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label
            className={`flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition ${
              isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/60'
            }`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
          >
            <UploadCloud className="mb-3 h-10 w-10 text-primary" />
            <p className="text-sm font-medium">Drag and drop your syllabus file here</p>
            <p className="text-xs text-muted-foreground">PDF or DOCX (max 10 MB)</p>
            <Input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={onInputFileChange} className="hidden" />
          </label>

          <div className="rounded-md border bg-muted/30 p-3 text-sm">
            <span className="font-medium">Selected file:</span> {fileLabel}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSubmit} disabled={!file || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ingesting...
                </>
              ) : (
                <>
                  <FileUp className="mr-2 h-4 w-4" />
                  Ingest Syllabus
                </>
              )}
            </Button>

            {file && (
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setParsedSyllabus(null);
                  setSuccess(null);
                  setError(null);
                }}
                disabled={isSubmitting}
              >
                Clear
              </Button>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <XCircle className="mt-0.5 h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 rounded-md border border-emerald-500/40 bg-emerald-50 p-3 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4" />
              <span>{success}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {parsedSyllabus && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Parsed Syllabus Preview</CardTitle>
            <CardDescription>
              Year {parsedSyllabus.year || 'N/A'} • Semester {parsedSyllabus.semester || 'N/A'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {parsedSyllabus.subjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subjects detected by AI.</p>
            ) : (
              parsedSyllabus.subjects.map((subject, subjectIdx) => (
                <div key={`${subject.code}-${subjectIdx}`} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <p className="font-semibold">{subject.name || 'Unnamed Subject'}</p>
                    {subject.code && <Badge variant="secondary">{subject.code}</Badge>}
                  </div>

                  <div className="space-y-2">
                    {subject.units.map((unit, unitIdx) => (
                      <div key={`${unit.unitNumber}-${unitIdx}`} className="rounded-md border bg-muted/20 p-3">
                        <p className="text-sm font-medium">{unit.unitNumber || `Unit ${unitIdx + 1}`}</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                          {unit.topics.map((topic, topicIdx) => (
                            <li key={`${topic.topic}-${topicIdx}`}>
                              <span className="text-foreground">{topic.topic}</span>
                              {topic.subtopics.length > 0 && (
                                <span> - {topic.subtopics.join(', ')}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
