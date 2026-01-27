import mongoose, { Schema, Document } from 'mongoose';

export interface ISyllabus extends Document {
  year: string;
  semester: string;
  subjects: ISubject[];
  updatedBy: mongoose.Types.ObjectId; // Professor or Admin ID
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubject {
  name: string;
  topics: string[];
  units?: number;
}

const SubjectSchema: Schema = new Schema({
  name: { type: String, required: true },
  topics: [{ type: String }],
  units: { type: Number },
});

const SyllabusSchema: Schema = new Schema({
  year: { type: String, required: true },
  semester: { type: String, required: true },
  subjects: [SubjectSchema],
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
});

export default mongoose.models.Syllabus || mongoose.model<ISyllabus>('Syllabus', SyllabusSchema);