import { Response } from 'express';
import { historyService } from './history.service';
import { sendError, sendSuccess } from '../../utils/response';
import { AuthenticatedRequest } from '../../interfaces/request';

export const historyController = {
  getMonthlySummary: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const history = await historyService.getMonthlySummary(req.user!.id);
      return sendSuccess(res, 200, history);
    } catch (error) {
      return sendError(res, 500, 'Failed to fetch history');
    }
  },
};
