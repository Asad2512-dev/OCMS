// Main API router: every feature's routes are plugged in here under /api.
import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import { MESSAGES } from '../config/messages.js';

const router = Router();

router.get('/health', (req, res) => res.json({ success: true, message: MESSAGES.SERVER.HEALTHY }));
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
