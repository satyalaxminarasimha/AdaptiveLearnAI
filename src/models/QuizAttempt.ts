import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionResult {
  questionIndex: number;
  question: string;
  topic: string;
  subtopic?: string;
  prerequisites?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  points: number;
}

export interface IWeakAreaSummary {
  topic: string;
  subtopics: string[];
  prerequisites: string[];
  accuracy: number;
  severity: 'critical' | 'needs_work' | 'minor' | 'improving';
  recommendation: string;
}

export interface IPerformanceAnalysis {
  overallAnalysis: string;
  strengthAreas: Array<{ topic: string; accuracy: number; comment: string }>;
  weakAreas: IWeakAreaSummary[];
  difficultyAnalysis: {
    easy: { correct: number; total: number };
    medium: { correct: number; total: number };
    hard: { correct: number; total: number };
  };
  recommendations: string[];
  predictedGrade: string;
  improvementPlan: string;
}

export interface IQuizAttempt extends Document {
  studentId: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  answers: number[]; // array of selected option indices
  questionResults: IQuestionResult[]; // detailed results per question
  score: number;
  totalQuestions: number;
  percentage: number;
  status: 'pass' | 'fail' | 'attempted';
  timeTaken?: number; // in seconds
  unitName?: string;
  subject?: string;
  performanceAnalysis?: IPerformanceAnalysis;
  rank?: number;
  attemptedAt: Date;
  analyzedAt?: Date;
}

const QuestionResultSchema: Schema = new Schema({
  questionIndex: { type: Number, required: true },
  question: { type: String, required: true },
  topic: { type: String, required: true },
  subtopic: { type: String },
  prerequisites: [{ type: String }],
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  selectedAnswer: { type: Number, required: true },
  correctAnswer: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
  points: { type: Number, default: 0 },
}, { _id: false });

const WeakAreaSummarySchema: Schema = new Schema({
  topic: { type: String, required: true },
  subtopics: [{ type: String }],
  prerequisites: [{ type: String }],
  accuracy: { type: Number, required: true },
  severity: { type: String, enum: ['critical', 'needs_work', 'minor', 'improving'] },
  recommendation: { type: String },
}, { _id: false });

const PerformanceAnalysisSchema: Schema = new Schema({
  overallAnalysis: { type: String },
  strengthAreas: [{
    topic: { type: String },
    accuracy: { type: Number },
    comment: { type: String },
  }],
  weakAreas: [WeakAreaSummarySchema],
  difficultyAnalysis: {
    easy: { correct: { type: Number }, total: { type: Number } },
    medium: { correct: { type: Number }, total: { type: Number } },
    hard: { correct: { type: Number }, total: { type: Number } },
  },
  recommendations: [{ type: String }],
  predictedGrade: { type: String },
  improvementPlan: { type: String },
}, { _id: false });

const QuizAttemptSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: [{ type: Number }],
  questionResults: [QuestionResultSchema],
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  percentage: { type: Number, default: 0 },
  status: { type: String, enum: ['pass', 'fail', 'attempted'], required: true },
  timeTaken: { type: Number },
  unitName: { type: String },
  subject: { type: String },
  performanceAnalysis: PerformanceAnalysisSchema,
  rank: { type: Number },
  attemptedAt: { type: Date, default: Date.now },
  analyzedAt: { type: Date },
});

// Indexes for efficient queries
QuizAttemptSchema.index({ studentId: 1, quizId: 1 });
QuizAttemptSchema.index({ quizId: 1, percentage: -1 }); // For ranking
QuizAttemptSchema.index({ studentId: 1, subject: 1 });

export default mongoose.models.QuizAttempt || mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);