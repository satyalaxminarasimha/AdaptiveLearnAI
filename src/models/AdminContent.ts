import mongoose, { Schema, Document } from 'mongoose';
import './User';

export interface IAdminContent extends Document {
  title: string;
  content: string;
  type: 'announcement' | 'system-update' | 'policy' | 'maintenance' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetAudience: ('students' | 'professors' | 'admins')[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId; // Admin ID
  publishedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminContentSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: {
    type: String,
    enum: ['announcement', 'system-update', 'policy', 'maintenance', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  targetAudience: [{
    type: String,
    enum: ['students', 'professors', 'admins'],
    required: true
  }],
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  publishedAt: { type: Date },
  expiresAt: { type: Date },
}, {
  timestamps: true,
});

// Index for efficient queries
AdminContentSchema.index({ type: 1, isActive: 1, targetAudience: 1 });
AdminContentSchema.index({ createdAt: -1 });

export default mongoose.models.AdminContent || mongoose.model<IAdminContent>('AdminContent', AdminContentSchema);