import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { loginValidation, registerValidation } from './auth.validation';

const router = Router();

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/forgot-password', authController.forgotPassword);

// Add this line
router.post('/reset-password', authController.resetPassword);

router.get('/profile', authenticate, authController.profile);

export default router;