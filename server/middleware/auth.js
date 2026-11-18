// protect: only logged-in users may pass. authorize(...roles): only the listed roles may pass.
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyToken, clearAuthCookie } from '../utils/token.js';
import { AUTH } from '../config/constants.js';
import { MESSAGES } from '../config/messages.js';

const readToken = (token) => {
  try {
    return verifyToken(token);
  } catch {
    throw new AppError(MESSAGES.AUTH.SESSION_EXPIRED, 401);
  }
};

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[AUTH.COOKIE_NAME];
  if (!token) throw new AppError(MESSAGES.AUTH.NOT_LOGGED_IN, 401);

  const { id } = readToken(token);
  const user = await User.findById(id).populate('department', 'name');
  if (!user) {
    clearAuthCookie(res);
    throw new AppError(MESSAGES.AUTH.SESSION_EXPIRED, 401);
  }
  if (!user.isActive) {
    clearAuthCookie(res);
    throw new AppError(MESSAGES.AUTH.ACCOUNT_DISABLED, 403);
  }
  req.user = user;
  next();
});

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(new AppError(MESSAGES.AUTH.FORBIDDEN, 403));
  next();
};
