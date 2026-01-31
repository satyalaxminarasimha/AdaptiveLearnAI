import mongoose, { Schema, Document } from 'mongoose';

export interface IChangeRequest extends Document {
  userId: mongoose.Types.ObjectId;
  userRole: 'student' | 'professor';
  requestType: 'profile_update' | 'details_change' | 'other';
  title: string;
  description: string;
  requestedChanges: {
    field: string;
    currentValue: string;
    newValue: string;
  }[];
  status: 'pending' | 'approved' | 'rejected';
  adminResponse?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChangeRequestSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userRole: { type: String, enum: ['student', 'professor'], required: true },
  requestType: { type: String, enum: ['profile_update', 'details_change', 'other'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  requestedChanges: [{
    field: { type: String, required: true },
    currentValue: { type: String },
    newValue: { type: String, required: true },
  }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminResponse: { type: String },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
}, {
  timestamps: true,
});

export default mongoose.models.ChangeRequest || mongoose.model<IChangeRequest>('ChangeRequest', ChangeRequestSchema);
