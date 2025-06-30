export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'client' | 'vendor';
  partyName?: string; // For clients
  transporterName?: string; // For vendors
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  _id: string;
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
  documents: Document[];
  assignedVendor?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  _id: string;
  jobId: string;
  type: 'bl' | 'invoice' | 'pod' | 'other';
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface DashboardStats {
  totalJobs: number;
  inTransit: number;
  delivered: number;
  pending: number;
  thisMonth: number;
  lastMonth: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface JobFilters {
  partyName?: string;
  destination?: string;
  status?: string;
  transporter?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} 