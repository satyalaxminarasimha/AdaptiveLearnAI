import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmissionRequest extends Document {
  name: string;
  email: string;
  role: 'student' | 'professor';
  // Student specific
  rollNo?: string;
  batch?: string;
  section?: string;
  // Professor specific
  expertise?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: mongoose.Types.ObjectId; // Admin ID
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdmissionRequestSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['student', 'professor'], required: true },
  // Student fields
  rollNo: { type: String },
  batch: { type: String },
  section: { type: String },
  // Professor fields
  expertise: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
}, {
  timestamps: true,
});

export default mongoose.models.AdmissionRequest || mongoose.model<IAdmissionRequest>('AdmissionRequest', AdmissionRequestSchema);