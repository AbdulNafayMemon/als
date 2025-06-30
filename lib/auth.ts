import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable');
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  partyName?: string;
  transporterName?: string;
}

export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    ...(user.role === 'client' && user.partyName ? { partyName: user.partyName } : {}),
    ...(user.role === 'vendor' && user.transporterName ? { transporterName: user.transporterName } : {}),
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export interface AuthenticatedRequest extends NextApiRequest {
  user?: JWTPayload;
}

export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const token = getTokenFromRequest(req);
      
      if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' });
      }

      const payload = verifyToken(token);
      if (!payload) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
      }

      req.user = payload;
      return handler(req, res);
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Authentication error' });
    }
  };
}

export function withRole(roles: string[]) {
  return (handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) => {
    return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'User not authenticated' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      return handler(req, res);
    });
  };
} 