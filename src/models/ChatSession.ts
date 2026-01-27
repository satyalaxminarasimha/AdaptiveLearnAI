import mongoose, { Schema, Document } from 'mongoose';

export interface IChatSession extends Document {
  userId: mongoose.Types.ObjectId;
  userRole: 'student' | 'professor' | 'admin';
  title: string;
  messages: Array<{
    sender: 'user' | 'ai';
    message: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSessionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userRole: { type: String, enum: ['student', 'professor', 'admin'], required: true },
  title: { type: String, required: true },
  messages: [
    {
      sender: { type: String, enum: ['user', 'ai'], required: true },
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
}, {
  timestamps: true,
});

export default mongoose.models.ChatSession || mongoose.model<IChatSession>('ChatSession', ChatSessionSchema);
