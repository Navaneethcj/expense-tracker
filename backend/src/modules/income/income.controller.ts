import { Response } from 'express';
import { incomeService } from './income.service';
import { sendError, sendSuccess } from '../../utils/response';
import { AuthenticatedRequest } from '../../interfaces/request';

export const incomeController = {
  list: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const income = await incomeService.list(req.user!.id);
      return sendSuccess(res, 200, income);
    } catch (error) {
      return sendError(res, 500, 'Failed to fetch income');
    }
  },

  getById: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const incomeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const income = await incomeService.getById(incomeId, req.user!.id);
      if (!income) {
        return sendError(res, 404, 'Income not found');
      }
      return sendSuccess(res, 200, income);
    } catch (error) {
      return sendError(res, 500, 'Failed to fetch income');
    }
  },

  create: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const income = await incomeService.create({ ...req.body, userId: req.user!.id });
      return sendSuccess(res, 201, income);
    } catch (error) {
      return sendError(res, 500, 'Failed to create income');
    }
  },

  update: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const incomeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const income = await incomeService.update(incomeId, req.user!.id, req.body);
      return sendSuccess(res, 200, income);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update income';
      return sendError(res, message === 'Income not found' ? 404 : 500, message);
    }
  },

  remove: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const incomeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await incomeService.remove(incomeId, req.user!.id);
      return sendSuccess(res, 200, { message: 'Income deleted successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete income';
      return sendError(res, message === 'Income not found' ? 404 : 500, message);
    }
  },
};
