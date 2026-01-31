import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'professor' | 'admin';
  avatarUrl?: string;
  phoneNumber?: string;
  // Student specific
  rollNo?: string;
  batch?: string;
  section?: string;
  branch?: string;
  semester?: number;
  fatherName?: string;
  motherName?: string;
  parentPhoneNumber?: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  // Professor specific
  expertise?: string;
  department?: string;
  classesTeaching?: Array<{
    subject: string;
    batch: string;
    section: string;
  }>;
  // Status
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClassTeachingSchema: Schema = new Schema({
  subject: { type: String, required: true },
  batch: { type: String, required: true },
  section: { type: String, required: true },
}, { _id: false });

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'professor', 'admin'], required: true },
  avatarUrl: { type: String },
  phoneNumber: { type: String },
  // Student fields
  rollNo: { type: String },
  batch: { type: String },
  section: { type: String },
  branch: { type: String },
  semester: { type: Number },
  fatherName: { type: String },
  motherName: { type: String },
  parentPhoneNumber: { type: String },
  address: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  bloodGroup: { type: String },
  // Professor fields
  expertise: { type: String },
  department: { type: String },
  classesTeaching: [ClassTeachingSchema],
  // Status
  isApproved: { type: Boolean, default: false },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);