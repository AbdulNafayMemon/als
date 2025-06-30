import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Job from '@/lib/models/Job';
import { withRole, AuthenticatedRequest } from '@/lib/auth';
import { ApiResponse, DashboardStats } from '@/types';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<ApiResponse<DashboardStats>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { user } = req;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Build base filter based on user role
    let baseFilter: any = {};
    if (user?.role === 'client' && user.partyName) {
      baseFilter.partyName = user.partyName;
    } else if (user?.role === 'vendor' && user.transporterName) {
      baseFilter.transporter = user.transporterName;
    }

    // Get total jobs
    const totalJobs = await Job.countDocuments(baseFilter);

    // Get jobs by status
    const [inTransit, delivered, pending] = await Promise.all([
      Job.countDocuments({ ...baseFilter, status: 'in_transit' }),
      Job.countDocuments({ ...baseFilter, status: 'delivered' }),
      Job.countDocuments({ ...baseFilter, status: 'pending' }),
    ]);

    // Get this month's jobs
    const thisMonthFilter = {
      ...baseFilter,
      date: { $gte: startOfMonth },
    };
    const thisMonth = await Job.countDocuments(thisMonthFilter);

    // Get last month's jobs
    const lastMonthFilter = {
      ...baseFilter,
      date: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    };
    const lastMonth = await Job.countDocuments(lastMonthFilter);

    const stats: DashboardStats = {
      totalJobs,
      inTransit,
      delivered,
      pending,
      thisMonth,
      lastMonth,
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export default withRole(['admin', 'client', 'vendor'])(handler);