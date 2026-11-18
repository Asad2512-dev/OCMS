// Notification endpoints for the logged-in user.
import { Router } from 'express';
import * as N from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParam } from '../validators/complaintValidators.js';

const router = Router();
router.use(protect);

router.get('/', N.listNotifications);
router.get('/unread-count', N.unreadCount);
router.patch('/read-all', N.markAllRead);
router.patch('/:id/read', idParam, validate, N.markRead);

export default router;
