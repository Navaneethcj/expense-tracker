import { Request, Response } from 'express';
import { expensesService } from './expenses.service';
import { sendError, sendSuccess } from '../../utils/response';
import { AuthenticatedRequest } from '../../interfaces/request';

export const expensesController = {
  list: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const expenses = await expensesService.list(req.user!.id);
      return sendSuccess(res, 200, expenses);
    } catch (error) {
      return sendError(res, 500, 'Failed to fetch expenses');
    }
  },

  getById: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const expenseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const expense = await expensesService.getById(expenseId, req.user!.id);
      if (!expense) {
        return sendError(res, 404, 'Expense not found');
      }
      return sendSuccess(res, 200, expense);
    } catch (error) {
      return sendError(res, 500, 'Failed to fetch expense');
    }
  },

  create: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const expense = await expensesService.create({ ...req.body, userId: req.user!.id });
      return sendSuccess(res, 201, expense);
    } catch (error) {
      return sendError(res, 500, 'Failed to create expense');
    }
  },

  update: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const expenseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const expense = await expensesService.update(expenseId, req.user!.id, req.body);
      return sendSuccess(res, 200, expense);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update expense';
      return sendError(res, message === 'Expense not found' ? 404 : 500, message);
    }
  },

  remove: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const expenseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await expensesService.remove(expenseId, req.user!.id);
      return sendSuccess(res, 200, { message: 'Expense deleted successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete expense';
      return sendError(res, message === 'Expense not found' ? 404 : 500, message);
    }
  },
};
