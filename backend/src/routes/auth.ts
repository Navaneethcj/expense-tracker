import { Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { sendError, sendSuccess } from '../utils/response';

const router = Router();

const generateToken = (user: { id: string; email: string; name: string }) => {
  const secret = process.env.JWT_SECRET || 'development-secret';
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, errors.array()[0].msg);
    }

    try {
      const { name, email, password } = req.body;
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return sendError(res, 409, 'User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      const token = generateToken(user);
      return sendSuccess(res, 201, { token, user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } });
    } catch (error) {
      return sendError(res, 500, 'Failed to register user');
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, errors.array()[0].msg);
    }

    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return sendError(res, 401, 'Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return sendError(res, 401, 'Invalid credentials');
      }

      const token = generateToken(user);
      return sendSuccess(res, 200, { token, user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } });
    } catch (error) {
      return sendError(res, 500, 'Failed to login');
    }
  }
);

router.get('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    return sendSuccess(res, 200, { user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve profile');
  }
});

export default router;
