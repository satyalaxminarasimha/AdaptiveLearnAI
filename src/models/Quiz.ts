import mongoose, { Schema, Document } from 'mongoose';

export interface IQuiz extends Document {
  title: string;
  subject: string;
  topics: string[];
  questions: IQuestion[];
  createdBy: mongoose.Types.ObjectId; // Professor ID
  dueDate?: Date;
  isActive: boolean;
  batch?: string;
  section?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  passPercentage?: number;
  duration?: number; // in minutes
  totalAttempts?: number;
  averageScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
  points?: number;
}

const QuestionSchema: Schema = new Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String },
  points: { type: Number, default: 10 },
});

const QuizSchema: Schema = new Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  topics: [{ type: String }],
  questions: [QuestionSchema],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  dueDate: { type: Date },
  isActive: { type: Boolean, default: true },
  batch: { type: String },
  section: { type: String },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  passPercentage: { type: Number, default: 60 },
  duration: { type: Number, default: 30 },
  totalAttempts: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
}, {
  timestamps: true,
});

export default mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);