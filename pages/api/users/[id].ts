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

  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      return getUser(req, res, id as string);
    case 'PUT':
      return updateUser(req, res, id as string);
    case 'DELETE':
      return deleteUser(req, res, id as string);
    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function getUser(
  req: AuthenticatedRequest,
  res: NextApiResponse<ApiResponse<any>>,
  userId: string
) {
  try {
    const user = await User.findById(userId, { password: 0 }).lean();
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function updateUser(
  req: AuthenticatedRequest,
  res: NextApiResponse<ApiResponse<any>>,
  userId: string
) {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const updateData = req.body;
    
    // Don't allow updating email if it already exists for another user
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({ 
        email: updateData.email.toLowerCase(),
        _id: { $ne: userId }
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists',
        });
      }
    }

    // Validate role-specific fields
    if (updateData.role === 'client' && !updateData.partyName) {
      return res.status(400).json({
        success: false,
        error: 'Party name is required for clients',
      });
    }

    if (updateData.role === 'vendor' && !updateData.transporterName) {
      return res.status(400).json({
        success: false,
        error: 'Transporter name is required for vendors',
      });
    }

    // Update user
    Object.assign(user, updateData);
    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      data: userResponse,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function deleteUser(
  req: AuthenticatedRequest,
  res: NextApiResponse<ApiResponse<any>>,
  userId: string
) {
  try {
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export default withRole(['admin'])(handler); 