// Builds the Express app: security, logging, parsing, routes and error handling (no server start here).
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import { sanitize } from './middleware/sanitize.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { SECURITY } from './config/constants.js';
import { MESSAGES } from './config/messages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.set('trust proxy', 1); // correct client IPs behind hosting proxies (for rate limiting)

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(
  '/api',
  rateLimit({
    windowMs: SECURITY.RATE_LIMIT_WINDOW_MS,
    max: SECURITY.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: MESSAGES.ERRORS.TOO_MANY_REQUESTS },
  })
);
app.use(express.json({ limit: SECURITY.JSON_LIMIT }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sanitize);

// Uploaded files (complaint attachments) are served from /uploads.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
