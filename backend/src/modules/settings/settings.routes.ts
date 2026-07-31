import { Router } from 'express';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, (_req, res) => {
  res.json({ success: true, data: { currency: 'INR', theme: 'light', notifications: true } });
});

router.put('/', authenticate, (_req, res) => {
  res.json({ success: true, data: { message: 'Settings updated' } });
});

export default router;
