import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface IClassTeaching {
  subject: string;
  subjectCode?: string;
  program?: string;
  course?: string;
  batch: string;
  semester?: string;
  section: string;
  year?: number;
  status?: 'active' | 'completed';
  syllabusId?: mongoose.Types.ObjectId;
  credits?: number;
  category?: string;
  regulation?: string;
  topics?: Array<{
    topic: string;
    status: 'not-started' | 'in-progress' | 'completed';
  }>;
  timeSlots?: ITimeSlot[];
  addedAt?: Date;
}

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
  employeeId?: string;
  expertise?: string;
  department?: string;
  classesTeaching?: IClassTeaching[];
  // Status
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TimeSlotSchema: Schema = new Schema({
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
}, { _id: false });

const TopicSchema: Schema = new Schema({
  topic: { type: String, required: true },
  status: { type: String, enum: ['not-started', 'in-progress', 'completed'], default: 'not-started' },
}, { _id: false });

const ClassTeachingSchema: Schema = new Schema({
  subject: { type: String, required: true },
  subjectCode: { type: String },
  program: { type: String },
  course: { type: String },
  batch: { type: String, required: true },
  semester: { type: String },
  section: { type: String, required: true },
  year: { type: Number },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  syllabusId: { type: Schema.Types.ObjectId, ref: 'Syllabus' },
  credits: { type: Number },
  category: { type: String },
  regulation: { type: String },
  topics: [TopicSchema],
  timeSlots: [TimeSlotSchema],
  addedAt: { type: Date, default: Date.now },
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
  employeeId: { type: String },
  expertise: { type: String },
  department: { type: String },
  classesTeaching: [ClassTeachingSchema],
  // Status
  isApproved: { type: Boolean, default: false },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);