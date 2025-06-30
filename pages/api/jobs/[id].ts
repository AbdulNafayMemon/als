import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Job from '@/lib/models/Job';
import { withRole, AuthenticatedRequest } from '@/lib/auth';
import { ApiResponse } from '@/types';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<ApiResponse<any>>
) {
  await dbConnect();

  const { id } = req.query;
  const { user } = req;

  switch (req.method) {
    case 'GET':
      return getJob(req, res, id as string);
    case 'PUT':
      return updateJob(req, res, id as string);
    case 'DELETE':
      return deleteJob(req, res, id as string);
    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function getJob(
  req: AuthenticatedRequest,
  res: NextApiResponse<ApiResponse<any>>,
  jobId: string
) {
  try {
    const job = await Job.findById(jobId).lean();
    if (!job || Array.isArray(job)) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Check permissions based on user role
    if (req.user?.role === 'client' && job.partyName !== req.user.partyName) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    
    if (req.user?.role === 'vendor' && job.transporter !== req.user.transporterName) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function updateJob(
  req: AuthenticatedRequest,
  res: NextApiResponse<ApiResponse<any>>,
  jobId: string
) {
  try {
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Check permissions based on user role
    if (req.user?.role === 'client') {
      return res.status(403).json({ success: false, error: 'Clients cannot update jobs' });
    }
    
    if (req.user?.role === 'vendor' && job.transporter !== req.user.transporterName) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const updateData = req.body;
    
    // Check if status is being changed from 'pending' to another status and vessel is missing
    if (
      updateData.status &&
      updateData.status !== 'pending' &&
      job.status === 'pending' &&
      !('vessel' in updateData ? updateData.vessel : job.vessel)
    ) {
      return res.status(400).json({
        success: false,
        error: 'vessel is required to change status from pending',
      });
    }

    // Only allow vendors to update specific fields
    if (req.user?.role === 'vendor') {
      const allowedFields = ['vehicleAtd', 'vehicleArrv', 'status', 'remarks'];
      const filteredData: any = {};
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });

      // Update the job with filtered data
      Object.assign(job, filteredData);
    } else {
      // Admin can update all fields
      Object.assign(job, updateData);
    }

    await job.save();

    res.status(200).json({
      success: true,
      data: job,
      message: 'Job updated successfully',
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function deleteJob(
  req: AuthenticatedRequest,
  res: NextApiResponse<ApiResponse<any>>,
  jobId: string
) {
  try {
    // Only admins can delete jobs
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only admins can delete jobs' });
    }

    const job = await Job.findByIdAndDelete(jobId);
    
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export default withRole(['admin', 'client', 'vendor'])(handler); 