import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  date: Date;
  jobNumber: string;
  invoiceNumber: string;
  partyName: string;
  containerType: 'CTNS' | 'FCL' | 'LCL';
  shippingLine: string;
  destination: string;
  vessel: string;
  truck: string;
  containerNumbers: string[];
  port: string;
  cutOffDate: Date;
  etd: Date;
  vehicleAtd?: Date;
  vehicleArrv?: Date;
  transporter: string;
  remarks?: string;
  cellNumber?: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cleared' | 'dispatched';
  assignedVendor?: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>({
  date: {
    type: Date,
    required: true,
  },
  jobNumber: {
    type: String,
    required: true,
    trim: true,
  },
  invoiceNumber: {
    type: String,
    required: true,
    trim: true,
  },
  partyName: {
    type: String,
    required: true,
    trim: true,
  },
  containerType: {
    type: String,
    enum: ['CTNS', 'FCL', 'LCL'],
    required: true,
  },
  shippingLine: {
    type: String,
    required: true,
    trim: true,
  },
  destination: {
    type: String,
    required: true,
    trim: true,
  },
  vessel: {
    type: String,
    trim: true,
  },
  truck: {
    type: String,
    required: true,
    trim: true,
  },
  containerNumbers: [{
    type: String,
    trim: true,
  }],
  port: {
    type: String,
    required: true,
    trim: true,
  },
  cutOffDate: {
    type: Date,
    required: true,
  },
  etd: {
    type: Date,
    required: true,
  },
  vehicleAtd: {
    type: Date,
  },
  vehicleArrv: {
    type: Date,
  },
  transporter: {
    type: String,
    required: true,
    trim: true,
  },
  remarks: {
    type: String,
    trim: true,
  },
  cellNumber: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in_transit', 'delivered', 'cleared', 'dispatched'],
    default: 'pending',
  },
  assignedVendor: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
jobSchema.index({ date: -1 });
jobSchema.index({ partyName: 1 });
jobSchema.index({ destination: 1 });
jobSchema.index({ transporter: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ invoiceNumber: 1 });
jobSchema.index({ containerNumbers: 1 });
jobSchema.index({ assignedVendor: 1 });

// Compound indexes for common queries
jobSchema.index({ partyName: 1, status: 1 });
jobSchema.index({ transporter: 1, status: 1 });
jobSchema.index({ date: -1, status: 1 });

export default mongoose.models.Job || mongoose.model<IJob>('Job', jobSchema); 