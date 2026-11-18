// Dashboard notifications for the logged-in user: list, unread count, mark one / all as read.
import Notification from '../models/Notification.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { paging } from '../services/complaintQuery.js';
import { MESSAGES } from '../config/messages.js';

const N = MESSAGES.NOTIFICATION;

// GET /api/notifications?unread=true&page=1&limit=10
export const listNotifications = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id, ...(req.query.unread === 'true' && { isRead: false }) };
  const { page, limit, skip } = paging(req.query);
  const [items, total] = await Promise.all([
    Notification.find(filter).sort('-createdAt').skip(skip).limit(limit).populate('complaint', 'complaintId title status'),
    Notification.countDocuments(filter),
  ]);
  res.json({ success: true, message: N.LIST, pagination: { page, limit, total, pages: Math.ceil(total / limit) }, notifications: items });
});

// GET /api/notifications/unread-count
export const unreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ user: req.user._id, isRead: false });
  res.json({ success: true, message: N.COUNT, count });
});

// PATCH /api/notifications/:id/read
export const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );
  if (!notification) throw new AppError(N.NOT_FOUND, 404);
  res.json({ success: true, message: N.READ, notification });
});

// PATCH /api/notifications/read-all
export const markAllRead = asyncHandler(async (req, res) => {
  const { modifiedCount } = await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true, message: N.ALL_READ, updated: modifiedCount });
});
