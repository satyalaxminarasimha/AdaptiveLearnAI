import mongoose, { Schema, Document } from 'mongoose';

export interface IQuiz extends Document {
  title: string;
  subject: string;
  topics: string[];
  questions: IQuestion[];
  createdBy: mongoose.Types.ObjectId; // Professor ID
  dueDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
}

const QuestionSchema: Schema = new Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String },
});

const QuizSchema: Schema = new Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  topics: [{ type: String }],
  questions: [QuestionSchema],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  dueDate: { type: Date },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

export default mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);