// Main API router. Feature routes (auth, complaints, …) will be plugged in here.
import { Router } from 'express';
import { MESSAGES } from '../config/messages.js';

const router = Router();

router.get('/health', (req, res) => res.json({ success: true, message: MESSAGES.SERVER.HEALTHY }));

export default router;
