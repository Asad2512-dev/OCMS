// Catches every error in one place and sends a clean JSON response. Also handles unknown routes (404).
import { MESSAGES } from '../config/messages.js';

export const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: `${MESSAGES.ERRORS.NOT_FOUND}: ${req.originalUrl}` });
};

// Turns common Mongoose errors into friendly messages.
const normalize = (err) => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return { status: 400, message: MESSAGES.ERRORS.VALIDATION, errors };
  }
  if (err.code === 11000) {
    return { status: 409, message: `${MESSAGES.ERRORS.DUPLICATE} ${Object.keys(err.keyValue).join(', ')}` };
  }
  if (err.name === 'CastError') return { status: 400, message: MESSAGES.ERRORS.INVALID_ID };
  return { status: err.statusCode || 500, message: err.message || MESSAGES.ERRORS.SERVER };
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const { status, message, errors } = normalize(err);
  if (status >= 500) console.error(err);
  res.status(status).json({
    success: false,
    message: status >= 500 && process.env.NODE_ENV === 'production' ? MESSAGES.ERRORS.SERVER : message,
    ...(errors && { errors }),
  });
};
