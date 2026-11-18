// Complaint endpoints. Each route lists who may use it.
import { Router } from 'express';
import * as C from '../controllers/complaintController.js';
import { createFeedback, getFeedback } from '../controllers/feedbackController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { uploadAttachments } from '../middleware/upload.js';
import * as R from '../validators/complaintValidators.js';
import { ROLES, COMPLAINANT_ROLES } from '../config/constants.js';

const router = Router();
router.use(protect);

// Everyone logged in (results depend on role)
router.get('/', R.listRules, validate, C.listComplaints);
router.get('/track/:code', R.trackRules, validate, C.trackComplaint);
router.post('/check-text', C.checkText);
router.get('/:id', R.idParam, validate, C.getComplaint);

// Students & teachers — uploads must be parsed before the text fields can be validated
router.post('/', authorize(...COMPLAINANT_ROLES), uploadAttachments, R.createComplaintRules, validate, C.createComplaint);

// Admin
router.patch('/:id/assign', authorize(ROLES.ADMIN), R.assignRules, validate, C.assignComplaint);
router.patch('/:id/reject', authorize(ROLES.ADMIN), R.rejectRules, validate, C.rejectComplaint);

// Officer (only on complaints assigned to them)
router.patch('/:id/status', authorize(ROLES.OFFICER), R.statusRules, validate, C.updateStatus);
router.post('/:id/remarks', authorize(ROLES.OFFICER, ROLES.ADMIN), R.remarkRules, validate, C.addRemark);

// Feedback (owner only, after resolved)
router.post('/:id/feedback', authorize(...COMPLAINANT_ROLES), R.feedbackRules, validate, createFeedback);
router.get('/:id/feedback', R.idParam, validate, getFeedback);

export default router;
