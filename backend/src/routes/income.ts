import { Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { sendError, sendSuccess } from '../utils/response';

const router = Router();

const getRouteParamId = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const income = await prisma.income.findMany({
      where: { userId: req.user?.id },
      orderBy: { date: 'desc' },
    });
    return sendSuccess(res, 200, income);
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch income');
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const incomeId = getRouteParamId(req.params.id);
    if (!incomeId) {
      return sendError(res, 400, 'Invalid income id');
    }

    const income = await prisma.income.findFirst({ where: { id: incomeId, userId: req.user?.id } });
    if (!income) {
      return sendError(res, 404, 'Income not found');
    }
    return sendSuccess(res, 200, income);
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch income');
  }
});

router.post(
  '/',
  authenticate,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than zero'),
    body('category').notEmpty().withMessage('Category is required'),
    body('date').notEmpty().withMessage('Date is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, errors.array()[0].msg);
    }

    try {
      const income = await prisma.income.create({
        data: {
          title: req.body.title,
          amount: Number(req.body.amount),
          category: req.body.category,
          description: req.body.description || null,
          date: new Date(req.body.date),
          userId: req.user!.id,
        },
      });
      return sendSuccess(res, 201, income);
    } catch (error) {
      return sendError(res, 500, 'Failed to create income');
    }
  }
);

router.put(
  '/:id',
  authenticate,
  [
    body('title').optional().notEmpty().withMessage('Title is required'),
    body('amount').optional().isFloat({ gt: 0 }).withMessage('Amount must be greater than zero'),
    body('category').optional().notEmpty().withMessage('Category is required'),
    body('date').optional().notEmpty().withMessage('Date is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, errors.array()[0].msg);
    }

    try {
      const incomeId = getRouteParamId(req.params.id);
      if (!incomeId) {
        return sendError(res, 400, 'Invalid income id');
      }

      const existingIncome = await prisma.income.findFirst({ where: { id: incomeId, userId: req.user?.id } });
      if (!existingIncome) {
        return sendError(res, 404, 'Income not found');
      }

      const income = await prisma.income.update({
        where: { id: incomeId },
        data: {
          title: req.body.title ?? existingIncome.title,
          amount: req.body.amount !== undefined ? Number(req.body.amount) : existingIncome.amount,
          category: req.body.category ?? existingIncome.category,
          description: req.body.description ?? existingIncome.description,
          date: req.body.date ? new Date(req.body.date) : existingIncome.date,
        },
      });
      return sendSuccess(res, 200, income);
    } catch (error) {
      return sendError(res, 500, 'Failed to update income');
    }
  }
);

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const incomeId = getRouteParamId(req.params.id);
    if (!incomeId) {
      return sendError(res, 400, 'Invalid income id');
    }

    const existingIncome = await prisma.income.findFirst({ where: { id: incomeId, userId: req.user?.id } });
    if (!existingIncome) {
      return sendError(res, 404, 'Income not found');
    }

    await prisma.income.delete({ where: { id: incomeId } });
    return sendSuccess(res, 200, { message: 'Income deleted successfully' });
  } catch (error) {
    return sendError(res, 500, 'Failed to delete income');
  }
});

export default router;
