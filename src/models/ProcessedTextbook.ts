/**
 * ProcessedTextbook model for MongoDB
 * Stores metadata about processed textbooks and their chunks
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IProcessedTextbook extends Document {
  textbookId: string;
  name: string;
  batch?: string;
  section?: string;
  subject?: string;
  syllabusId?: mongoose.Types.ObjectId;
  filePath?: string;
  sourceFileName?: string;
  uploadDate: Date;
  totalChunks: number;
  validChunks: number;
  processedAt: Date;
  extractedUnits: Array<{
    unitNumber: number;
    unitTitle: string;
    topicCount: number;
    chunkCount: number;
  }>;
  processingStats: {
    totalTime: number;
    extractionQuality: number;
    mappingAccuracy: number;
  };
  status: 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProcessedTextbookSchema: Schema<IProcessedTextbook> = new Schema(
  {
    textbookId: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true },
    batch: { type: String },
    section: { type: String },
    subject: { type: String },
    syllabusId: { type: Schema.Types.ObjectId, ref: 'Syllabus' },
    filePath: { type: String },
    sourceFileName: { type: String },
    uploadDate: { type: Date, default: Date.now },
    totalChunks: { type: Number, default: 0 },
    validChunks: { type: Number, default: 0 },
    processedAt: { type: Date },
    extractedUnits: [
      {
        unitNumber: { type: Number },
        unitTitle: { type: String },
        topicCount: { type: Number },
        chunkCount: { type: Number },
      },
    ],
    processingStats: {
      totalTime: { type: Number },
      extractionQuality: { type: Number },
      mappingAccuracy: { type: Number },
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

// Index for queries
ProcessedTextbookSchema.index({ batch: 1, section: 1 });
ProcessedTextbookSchema.index({ status: 1 });

export default mongoose.models.ProcessedTextbook ||
  mongoose.model<IProcessedTextbook>(
    'ProcessedTextbook',
    ProcessedTextbookSchema
  );
