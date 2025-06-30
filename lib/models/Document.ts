import mongoose, { Schema, Document as MongoDocument, Types } from 'mongoose';

export interface IDocument extends MongoDocument {
  jobId: Types.ObjectId;
  type: 'bl' | 'invoice' | 'pod' | 'other';
  fileName: string;
  fileUrl: string;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
}

const documentSchema = new Schema<IDocument>({
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  type: {
    type: String,
    enum: ['bl', 'invoice', 'pod', 'other'],
    required: true,
  },
  fileName: {
    type: String,
    required: true,
    trim: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
documentSchema.index({ jobId: 1 });
documentSchema.index({ type: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ uploadedAt: -1 });

export default mongoose.models.Document || mongoose.model<IDocument>('Document', documentSchema); 