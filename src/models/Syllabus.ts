import mongoose, { Schema, Document } from 'mongoose';

export type CompletionStatus = 'not-started' | 'in-progress' | 'completed';

export interface ITopicCompletion {
  topic: string;
  status: CompletionStatus;
  isCompleted: boolean; // kept for backward compatibility
  completedDate?: Date;
  completedBy?: mongoose.Types.ObjectId;
  notes?: string; // optional notes by professor
}

export interface ISubject {
  name: string;
  code?: string;
  credits?: number;
  category?: string; // BS, PC, ES, HS, SOC, PE, OE
  topics: ITopicCompletion[];
  units?: number;
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  courseObjectives?: string[];
  courseOutcomes?: string[];
  textbooks?: string[];
  references?: string[];
}

export interface ISyllabus extends Document {
  year: string;
  semester: string;
  batch: string;
  section: string;
  program?: string; // e.g., CSE(AI&ML), CSE, ECE
  regulation?: string; // e.g., R20, R19
  subjects: ISubject[];
  updatedBy: mongoose.Types.ObjectId; // Professor or Admin ID
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TopicCompletionSchema: Schema = new Schema({
  topic: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['not-started', 'in-progress', 'completed'], 
    default: 'not-started' 
  },
  isCompleted: { type: Boolean, default: false }, // kept for backward compatibility
  completedDate: { type: Date },
  completedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
}, { _id: false });

const SubjectSchema: Schema = new Schema({
  name: { type: String, required: true },
  code: { type: String },
  credits: { type: Number },
  category: { type: String }, // BS, PC, ES, HS, SOC, PE, OE
  topics: [TopicCompletionSchema],
  units: { type: Number },
  totalTopics: { type: Number, default: 0 },
  completedTopics: { type: Number, default: 0 },
  inProgressTopics: { type: Number, default: 0 },
  courseObjectives: [{ type: String }],
  courseOutcomes: [{ type: String }],
  textbooks: [{ type: String }],
  references: [{ type: String }],
});

const SyllabusSchema: Schema = new Schema({
  year: { type: String, required: true },
  semester: { type: String, required: true },
  batch: { type: String, required: true },
  section: { type: String, required: true },
  program: { type: String, default: 'CSE(AI&ML)' },
  regulation: { type: String, default: 'R20' },
  subjects: [SubjectSchema],
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lastUpdated: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// Index for efficient queries
SyllabusSchema.index({ year: 1, semester: 1, batch: 1, section: 1 });
SyllabusSchema.index({ program: 1, regulation: 1 });

export default mongoose.models.Syllabus || mongoose.model<ISyllabus>('Syllabus', SyllabusSchema);