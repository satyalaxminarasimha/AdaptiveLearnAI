import mongoose, { Schema, Document } from 'mongoose';

export interface IPublicChatMessage {
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  senderRole: 'student' | 'professor';
  message: string;
  timestamp: Date;
}

export interface IPublicChat extends Document {
  // Chat room identifier
  roomType: 'class' | 'subject';
  // For class-based chat
  batch?: string;
  section?: string;
  // For subject-based chat (professor's subject chat)
  subject?: string;
  professorId?: mongoose.Types.ObjectId;
  // Messages
  messages: IPublicChatMessage[];
  participants: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PublicChatMessageSchema: Schema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ['student', 'professor'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: true });

const PublicChatSchema: Schema = new Schema({
  roomType: { type: String, enum: ['class', 'subject'], required: true },
  batch: { type: String },
  section: { type: String },
  subject: { type: String },
  professorId: { type: Schema.Types.ObjectId, ref: 'User' },
  messages: [PublicChatMessageSchema],
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// Create compound indexes for efficient queries
PublicChatSchema.index({ roomType: 1, batch: 1, section: 1 });
PublicChatSchema.index({ roomType: 1, subject: 1, professorId: 1 });

export default mongoose.models.PublicChat || mongoose.model<IPublicChat>('PublicChat', PublicChatSchema);
