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
    const expenses = await prisma.expense.findMany({
      where: { userId: req.user?.id },
      orderBy: { date: 'desc' },
    });
    return sendSuccess(res, 200, expenses);
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch expenses');
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const expenseId = getRouteParamId(req.params.id);
    if (!expenseId) {
      return sendError(res, 400, 'Invalid expense id');
    }

    const expense = await prisma.expense.findFirst({ where: { id: expenseId, userId: req.user?.id } });
    if (!expense) {
      return sendError(res, 404, 'Expense not found');
    }
    return sendSuccess(res, 200, expense);
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch expense');
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
      const expense = await prisma.expense.create({
        data: {
          title: req.body.title,
          amount: Number(req.body.amount),
          category: req.body.category,
          description: req.body.description || null,
          date: new Date(req.body.date),
          userId: req.user!.id,
        },
      });
      return sendSuccess(res, 201, expense);
    } catch (error) {
      return sendError(res, 500, 'Failed to create expense');
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
      const expenseId = getRouteParamId(req.params.id);
      if (!expenseId) {
        return sendError(res, 400, 'Invalid expense id');
      }

      const existingExpense = await prisma.expense.findFirst({ where: { id: expenseId, userId: req.user?.id } });
      if (!existingExpense) {
        return sendError(res, 404, 'Expense not found');
      }

      const expense = await prisma.expense.update({
        where: { id: expenseId },
        data: {
          title: req.body.title ?? existingExpense.title,
          amount: req.body.amount !== undefined ? Number(req.body.amount) : existingExpense.amount,
          category: req.body.category ?? existingExpense.category,
          description: req.body.description ?? existingExpense.description,
          date: req.body.date ? new Date(req.body.date) : existingExpense.date,
        },
      });
      return sendSuccess(res, 200, expense);
    } catch (error) {
      return sendError(res, 500, 'Failed to update expense');
    }
  }
);

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const expenseId = getRouteParamId(req.params.id);
    if (!expenseId) {
      return sendError(res, 400, 'Invalid expense id');
    }

    const existingExpense = await prisma.expense.findFirst({ where: { id: expenseId, userId: req.user?.id } });
    if (!existingExpense) {
      return sendError(res, 404, 'Expense not found');
    }

    await prisma.expense.delete({ where: { id: expenseId } });
    return sendSuccess(res, 200, { message: 'Expense deleted successfully' });
  } catch (error) {
    return sendError(res, 500, 'Failed to delete expense');
  }
});

export default router;
