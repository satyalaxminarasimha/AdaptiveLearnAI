import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentRanking extends Document {
  studentId: mongoose.Types.ObjectId;
  batch: string;
  section: string;
  branch: string;
  // Score metrics
  totalScore: number;
  averageScore: number;
  quizzesAttempted: number;
  quizzesPassed: number;
  // Rankings
  classRank: number;
  batchRank: number;
  overallRank: number;
  // Subject-wise performance
  subjectScores: {
    subject: string;
    totalScore: number;
    averageScore: number;
    quizzesAttempted: number;
    rank: number;
  }[];
  // Streak and engagement
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  // Time-based metrics
  weeklyScore: number;
  monthlyScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectScoreSchema: Schema = new Schema({
  subject: { type: String, required: true },
  totalScore: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  quizzesAttempted: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
}, { _id: false });

const StudentRankingSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  batch: { type: String, required: true },
  section: { type: String, required: true },
  branch: { type: String, default: 'CSM' },
  // Score metrics
  totalScore: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  quizzesAttempted: { type: Number, default: 0 },
  quizzesPassed: { type: Number, default: 0 },
  // Rankings
  classRank: { type: Number, default: 0 },
  batchRank: { type: Number, default: 0 },
  overallRank: { type: Number, default: 0 },
  // Subject scores
  subjectScores: [SubjectScoreSchema],
  // Streaks
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActivityDate: { type: Date },
  // Time-based
  weeklyScore: { type: Number, default: 0 },
  monthlyScore: { type: Number, default: 0 },
}, {
  timestamps: true,
});

// Indexes for ranking queries
StudentRankingSchema.index({ batch: 1, section: 1, classRank: 1 });
StudentRankingSchema.index({ batch: 1, batchRank: 1 });
StudentRankingSchema.index({ overallRank: 1 });

export default mongoose.models.StudentRanking || mongoose.model<IStudentRanking>('StudentRanking', StudentRankingSchema);
