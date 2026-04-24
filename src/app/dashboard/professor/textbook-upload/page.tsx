import { TextbookProcessingPanel } from '@/components/textbook-processing-panel';

export default function ProfessorTextbookUploadPage() {
  return (
    <main className="flex-1 space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Upload Textbook</h1>
        <p className="text-sm text-muted-foreground">
          Upload a textbook PDF with its syllabus so the system can map units, store processed chunks, and reuse them for quizzes and chat.
        </p>
      </div>
      <TextbookProcessingPanel />
    </main>
  );
}