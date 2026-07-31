import { Router } from 'express';
import { incomeController } from './income.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, incomeController.list);
router.get('/:id', authenticate, incomeController.getById);
router.post('/', authenticate, incomeController.create);
router.put('/:id', authenticate, incomeController.update);
router.delete('/:id', authenticate, incomeController.remove);

export default router;
