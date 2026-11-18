// Creates dashboard notifications (no email/SMS). Failures are logged but never break the main request.
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { ROLES } from '../config/constants.js';

export const notify = async (userId, complaintId, message) => {
  try {
    if (userId) await Notification.create({ user: userId, complaint: complaintId, message });
  } catch (err) {
    console.error('Notification failed:', err.message);
  }
};

// Sends the same alert to every active admin (e.g. "new complaint waiting for assignment").
export const notifyAdmins = async (complaintId, message) => {
  const admins = await User.find({ role: ROLES.ADMIN, isActive: true }).select('_id');
  await Promise.all(admins.map((a) => notify(a._id, complaintId, message)));
};
