import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { loginValidation, registerValidation } from './auth.validation';

const router = Router();

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/profile', authenticate, authController.profile);

export default router;
