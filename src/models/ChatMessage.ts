import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
  studentId: mongoose.Types.ObjectId;
  sender: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

const ChatMessageSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: String, enum: ['user', 'ai'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);