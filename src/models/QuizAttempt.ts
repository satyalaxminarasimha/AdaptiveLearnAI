import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizAttempt extends Document {
  studentId: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  answers: number[]; // array of selected option indices
  score: number;
  totalQuestions: number;
  status: 'pass' | 'fail' | 'attempted';
  attemptedAt: Date;
}

const QuizAttemptSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: [{ type: Number }],
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  status: { type: String, enum: ['pass', 'fail', 'attempted'], required: true },
  attemptedAt: { type: Date, default: Date.now },
});

export default mongoose.models.QuizAttempt || mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);