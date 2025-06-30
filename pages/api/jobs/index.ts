import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Job from '@/lib/models/Job';
import { withRole, AuthenticatedRequest } from '@/lib/auth';
import { ApiResponse, JobFilters, PaginationParams, PaginatedResponse } from '@/types';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<ApiResponse<PaginatedResponse<any> | any>>
) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      return getJobs(req, res);
    case 'POST':
      return createJob(req, res);
    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function getJobs(
  req: AuthenticatedRequest,
  res: NextApiResponse<ApiResponse<PaginatedResponse<any>>>
) {
  try {
    const { user } = req;
    const {
      page = 1,
      limit = 10,
      partyName,
      destination,
      status,
      transporter,
      dateFrom,
      dateTo,
      search,
    } = req.query;

    // Build filter object based on user role
    let filter: any = {};

    if (user?.role === 'client' && user.partyName) {
      filter.partyName = user.partyName;
    } else if (user?.role === 'vendor' && user.transporterName) {
      filter.transporter = user.transporterName;
    }

    // Apply additional filters
    if (partyName) filter.partyName = { $regex: partyName, $options: 'i' };
    if (destination) filter.destination = { $regex: destination, $options: 'i' };
    if (status) filter.status = status;
    if (transporter) filter.transporter = { $regex: transporter, $options: 'i' };
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom as string);
      if (dateTo) filter.date.$lte = new Date(dateTo as string);
    }
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { containerNumbers: { $in: [new RegExp(search as string, 'i')] } },
        { partyName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Job.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.status(200).json({
      success: true,
      data: {
        data: jobs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function createJob(
  req: AuthenticatedRequest,
  res: NextApiResponse<ApiResponse<any>>
) {
  try {
    const jobData = req.body;
    
    // Validate required fields
    const requiredFields = [
      'date', 'jobNumber', 'invoiceNumber', 'partyName', 'containerType',
      'shippingLine', 'destination', 'truck', 'containerNumbers',
      'port', 'cutOffDate', 'etd', 'transporter'
    ];

    for (const field of requiredFields) {
      if (!jobData[field]) {
        return res.status(400).json({
          success: false,
          error: `${field} is required`,
        });
      }
    }
    // Vessel is only required if status is not 'pending'
    if ((jobData.status && jobData.status !== 'pending') && !jobData.vessel) {
      return res.status(400).json({
        success: false,
        error: 'vessel is required when status is not pending',
      });
    }

    // Convert container numbers string to array if needed
    if (typeof jobData.containerNumbers === 'string') {
      jobData.containerNumbers = jobData.containerNumbers
        .split('\n')
        .map((cn: string) => cn.trim())
        .filter((cn: string) => cn);
    }

    const job = new Job(jobData);
    await job.save();

    res.status(201).json({
      success: true,
      data: job,
      message: 'Job created successfully',
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export default withRole(['admin', 'client', 'vendor'])(handler); 