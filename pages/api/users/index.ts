import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { withRole, AuthenticatedRequest } from '@/lib/auth';
import { ApiResponse } from '@/types';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<ApiResponse<any>>
) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      return getUsers(req, res);
    case 'POST':
      return createUser(req, res);
    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function getUsers(
  req: AuthenticatedRequest,
  res: NextApiResponse<ApiResponse<any>>
) {
  try {
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function createUser(
  req: AuthenticatedRequest,
  res: NextApiResponse<ApiResponse<any>>
) {
  try {
    const userData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'password', 'role'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        return res.status(400).json({
          success: false,
          error: `${field} is required`,
        });
      }
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists',
      });
    }

    // Validate role-specific fields
    if (userData.role === 'client' && !userData.partyName) {
      return res.status(400).json({
        success: false,
        error: 'Party name is required for clients',
      });
    }

    if (userData.role === 'vendor' && !userData.transporterName) {
      return res.status(400).json({
        success: false,
        error: 'Transporter name is required for vendors',
      });
    }

    const user = new User(userData);
    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      data: userResponse,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export default withRole(['admin'])(handler); 