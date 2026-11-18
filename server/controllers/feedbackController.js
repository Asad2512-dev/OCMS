// Feedback on a complaint: only the owner, only once, only after it is resolved.
import Feedback from '../models/Feedback.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { isAbusive } from '../utils/profanity.js';
import { findVisibleComplaint } from '../services/complaintQuery.js';
import { STATUSES, ANONYMOUS_LABEL } from '../config/constants.js';
import { MESSAGES } from '../config/messages.js';

const F = MESSAGES.FEEDBACK;

// POST /api/complaints/:id/feedback  { rating, comment? }
export const createFeedback = asyncHandler(async (req, res) => {
  const complaint = await findVisibleComplaint(req.user, req.params.id, { populate: false });
  const { rating, comment } = req.body;

  if (complaint.submittedBy.toString() !== req.user._id.toString()) throw new AppError(F.NOT_OWNER, 403);
  if (complaint.status !== STATUSES.RESOLVED) throw new AppError(F.NOT_RESOLVED, 400);
  if (await Feedback.exists({ complaint: complaint._id, user: req.user._id })) throw new AppError(F.ALREADY, 409);
  if (isAbusive(comment)) throw new AppError(MESSAGES.COMPLAINT.PROFANITY, 400);

  const feedback = await Feedback.create({ complaint: complaint._id, user: req.user._id, rating, comment });
  res.status(201).json({ success: true, message: F.CREATED, feedback });
});

// GET /api/complaints/:id/feedback — anyone who can see the complaint; hides the user for anonymous complaints
export const getFeedback = asyncHandler(async (req, res) => {
  const complaint = await findVisibleComplaint(req.user, req.params.id, { populate: false });
  const feedback = await Feedback.findOne({ complaint: complaint._id }).populate('user', 'name role').lean();
  if (!feedback) return res.json({ success: true, message: F.NONE, feedback: null });

  const isOwner = complaint.submittedBy.toString() === req.user._id.toString();
  const hide = complaint.isAnonymous && !isOwner;
  res.json({
    success: true,
    message: F.DETAIL,
    feedback: hide ? { ...feedback, user: null, userName: ANONYMOUS_LABEL } : feedback,
  });
});
