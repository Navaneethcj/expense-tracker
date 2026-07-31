import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { sendError } from '../utils/response';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Authentication token is required');
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; email: string; name: string };

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return sendError(res, 401, 'User not found');
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    };
    next();
  } catch (error) {
    return sendError(res, 401, 'Invalid or expired token');
  }
};
