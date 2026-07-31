import { Router } from 'express';
import { expensesController } from './expenses.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, expensesController.list);
router.get('/:id', authenticate, expensesController.getById);
router.post('/', authenticate, expensesController.create);
router.put('/:id', authenticate, expensesController.update);
router.delete('/:id', authenticate, expensesController.remove);

export default router;
