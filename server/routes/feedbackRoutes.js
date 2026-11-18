// Admin list of all feedback.
import { Router } from 'express';
import { listFeedback } from '../controllers/feedbackController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = Router();
router.get('/', protect, authorize(ROLES.ADMIN), listFeedback);
export default router;
