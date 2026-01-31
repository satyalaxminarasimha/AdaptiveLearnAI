import mongoose, { Schema, Document } from 'mongoose';

export interface IWeakArea extends Document {
  studentId: mongoose.Types.ObjectId;
  subject: string;
  topic: string;
  subtopics: string[];
  prerequisites: string[];
  wrongAnswersCount: number;
  totalAttempts: number;
  lastAttemptDate: Date;
  improvementScore: number; // 0-100, tracks improvement over time
  status: 'critical' | 'needs_work' | 'improving' | 'mastered';
  quizAttempts: mongoose.Types.ObjectId[]; // References to quiz attempts where this topic was weak
  createdAt: Date;
  updatedAt: Date;
}

const WeakAreaSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  subtopics: [{ type: String }],
  prerequisites: [{ type: String }],
  wrongAnswersCount: { type: Number, default: 0 },
  totalAttempts: { type: Number, default: 0 },
  lastAttemptDate: { type: Date, default: Date.now },
  improvementScore: { type: Number, default: 0, min: 0, max: 100 },
  status: { 
    type: String, 
    enum: ['critical', 'needs_work', 'improving', 'mastered'], 
    default: 'needs_work' 
  },
  quizAttempts: [{ type: Schema.Types.ObjectId, ref: 'QuizAttempt' }],
}, {
  timestamps: true,
});

// Index for efficient student queries
WeakAreaSchema.index({ studentId: 1, subject: 1 });
WeakAreaSchema.index({ studentId: 1, status: 1 });

export default mongoose.models.WeakArea || mongoose.model<IWeakArea>('WeakArea', WeakAreaSchema);
