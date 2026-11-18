// Handles login, logout, "who am I" and change password.
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { setAuthCookie, clearAuthCookie } from '../utils/token.js';
import { userView } from '../utils/userView.js';
import { MESSAGES } from '../config/messages.js';

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password').populate('department', 'name');

  // Same message for "no such user" and "wrong password" so attackers can't guess emails.
  if (!user || !(await user.matchPassword(password))) throw new AppError(MESSAGES.AUTH.INVALID_CREDENTIALS, 401);
  if (!user.isActive) throw new AppError(MESSAGES.AUTH.ACCOUNT_DISABLED, 403);

  setAuthCookie(res, user._id);
  res.json({ success: true, message: MESSAGES.AUTH.LOGIN_SUCCESS, user: userView(user) });
});

// POST /api/auth/logout
export const logout = (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: MESSAGES.AUTH.LOGOUT_SUCCESS });
};

// GET /api/auth/me
export const getMe = (req, res) => {
  res.json({ success: true, message: MESSAGES.AUTH.ME, user: userView(req.user) });
};

// PATCH /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) throw new AppError(MESSAGES.AUTH.WRONG_CURRENT_PASSWORD, 400);
  if (currentPassword === newPassword) throw new AppError(MESSAGES.AUTH.SAME_PASSWORD, 400);

  user.password = newPassword; // hashed by the model's save hook
  await user.save();
  setAuthCookie(res, user._id); // refresh the session
  res.json({ success: true, message: MESSAGES.AUTH.PASSWORD_CHANGED });
});
