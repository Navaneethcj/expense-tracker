import { Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { sendError, sendSuccess } from '../utils/response';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const settings = await prisma.settings.findUnique({ where: { userId: req.user!.id } });
    if (!settings) {
      const created = await prisma.settings.create({
        data: {
          userId: req.user!.id,
          currency: 'USD',
          theme: 'light',
          notifications: true,
        },
      });
      return sendSuccess(res, 200, created);
    }
    return sendSuccess(res, 200, settings);
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch settings');
  }
});

router.put(
  '/',
  authenticate,
  [
    body('currency').optional().notEmpty().withMessage('Currency is required'),
    body('theme').optional().isIn(['light', 'dark']).withMessage('Theme must be light or dark'),
    body('notifications').optional().isBoolean().withMessage('Notifications must be a boolean'),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, errors.array()[0].msg);
    }

    try {
      const existing = await prisma.settings.findUnique({ where: { userId: req.user!.id } });
      const settings = await prisma.settings.upsert({
        where: { userId: req.user!.id },
        update: {
          currency: req.body.currency ?? existing?.currency ?? 'USD',
          theme: req.body.theme ?? existing?.theme ?? 'light',
          notifications: req.body.notifications ?? existing?.notifications ?? true,
        },
        create: {
          userId: req.user!.id,
          currency: req.body.currency ?? 'USD',
          theme: req.body.theme ?? 'light',
          notifications: req.body.notifications ?? true,
        },
      });
      return sendSuccess(res, 200, settings);
    } catch (error) {
      return sendError(res, 500, 'Failed to update settings');
    }
  }
);

export default router;
