import { Router } from 'express';
import { historyController } from './history.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, historyController.getMonthlySummary);

export default router;
