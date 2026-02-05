import mongoose, { Schema, Document } from 'mongoose';

export interface IQuiz extends Document {
  title: string;
  subject: string;
  topics: string[];
  unitName?: string; // e.g., "Unit I", "Unit II"
  unitNumber?: number; // 1, 2, 3, etc.
  questions: IQuestion[];
  createdBy: mongoose.Types.ObjectId; // Professor ID
  dueDate?: Date;
  isActive: boolean;
  isAIGenerated: boolean;
  batch?: string;
  section?: string;
  year?: string;
  semester?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  passPercentage?: number;
  duration?: number; // in minutes
  totalAttempts?: number;
  averageScore?: number;
  topScore?: number;
  unitSummary?: string;
  topicCoverage?: Array<{ topic: string; questionCount: number }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
  topic?: string;
  subtopic?: string;
  prerequisites?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  points?: number;
}

const QuestionSchema: Schema = new Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String },
  topic: { type: String },
  subtopic: { type: String },
  prerequisites: [{ type: String }],
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  points: { type: Number, default: 10 },
});

const QuizSchema: Schema = new Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  topics: [{ type: String }],
  unitName: { type: String },
  unitNumber: { type: Number },
  questions: [QuestionSchema],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  dueDate: { type: Date },
  isActive: { type: Boolean, default: true },
  isAIGenerated: { type: Boolean, default: false },
  batch: { type: String },
  section: { type: String },
  year: { type: String },
  semester: { type: String },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'mixed' },
  passPercentage: { type: Number, default: 60 },
  duration: { type: Number, default: 45 },
  totalAttempts: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  topScore: { type: Number, default: 0 },
  unitSummary: { type: String },
  topicCoverage: [{
    topic: { type: String },
    questionCount: { type: Number },
  }],
}, {
  timestamps: true,
});

// Indexes
QuizSchema.index({ subject: 1, unitName: 1 });
QuizSchema.index({ createdBy: 1, isActive: 1 });
QuizSchema.index({ batch: 1, section: 1, isActive: 1 });

export default mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);