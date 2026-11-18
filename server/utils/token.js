// Creates the login token (JWT) and puts it into / removes it from a secure httpOnly cookie.
import jwt from 'jsonwebtoken';
import { AUTH } from '../config/constants.js';
import { MESSAGES } from '../config/messages.js';

const secret = () => {
  if (!process.env.JWT_SECRET) throw new Error(MESSAGES.AUTH.MISSING_JWT_SECRET);
  return process.env.JWT_SECRET;
};

const cookieOptions = () => ({
  httpOnly: true, // JavaScript in the browser cannot read it
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
});

export const signToken = (userId) =>
  jwt.sign({ id: userId }, secret(), { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

export const verifyToken = (token) => jwt.verify(token, secret());

export const setAuthCookie = (res, userId) =>
  res.cookie(AUTH.COOKIE_NAME, signToken(userId), { ...cookieOptions(), maxAge: AUTH.COOKIE_MAX_AGE_MS });

export const clearAuthCookie = (res) => res.clearCookie(AUTH.COOKIE_NAME, cookieOptions());
