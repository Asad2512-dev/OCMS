// Handles complaint attachments with multer: up to 3 files, JPG/PNG/PDF only, max 5 MB each.
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';
import AppError from '../utils/AppError.js';
import { UPLOAD } from '../config/constants.js';
import { MESSAGES } from '../config/messages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.join(__dirname, '..', UPLOAD.DIR);
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Random file names so original names (which may identify a person) are never exposed.
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const ok = UPLOAD.ALLOWED_TYPES.includes(file.mimetype) && UPLOAD.ALLOWED_EXT.includes(ext);
  cb(ok ? null : new AppError(MESSAGES.UPLOAD.BAD_TYPE, 400), ok);
};

const uploader = multer({
  storage,
  fileFilter,
  limits: { fileSize: UPLOAD.MAX_SIZE_MB * 1024 * 1024, files: UPLOAD.MAX_FILES },
}).array(UPLOAD.FIELD, UPLOAD.MAX_FILES);

// Turns multer's technical errors into friendly messages.
const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: MESSAGES.UPLOAD.TOO_LARGE,
  LIMIT_FILE_COUNT: MESSAGES.UPLOAD.TOO_MANY,
  LIMIT_UNEXPECTED_FILE: MESSAGES.UPLOAD.TOO_MANY,
};

export const uploadAttachments = (req, res, next) =>
  uploader(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) return next(new AppError(MULTER_MESSAGES[err.code] || MESSAGES.UPLOAD.FAILED, 400));
    next(err);
  });

// Converts saved files into the shape stored on a complaint.
export const toAttachments = (files = []) =>
  files.map((f) => ({ url: `/${UPLOAD.DIR}/${f.filename}`, filename: f.originalname, mimetype: f.mimetype, size: f.size }));
