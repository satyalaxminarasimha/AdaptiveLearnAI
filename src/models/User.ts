import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'professor' | 'admin';
  avatarUrl?: string;
  // Student specific
  rollNo?: string;
  batch?: string;
  section?: string;
  // Professor specific
  expertise?: string;
  // Status
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'professor', 'admin'], required: true },
  avatarUrl: { type: String },
  // Student fields
  rollNo: { type: String },
  batch: { type: String },
  section: { type: String },
  // Professor fields
  expertise: { type: String },
  // Status
  isApproved: { type: Boolean, default: false },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);