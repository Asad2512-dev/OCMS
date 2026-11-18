// Entry point of the backend: loads settings, connects to MongoDB and starts the Express server.
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MESSAGES } from './config/messages.js';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Simple health check so we can confirm the server is alive.
app.get('/api/health', (req, res) => res.json({ message: MESSAGES.SERVER.HEALTHY }));

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(MESSAGES.SERVER.DB_CONNECTED);
    app.listen(PORT, () => console.log(`${MESSAGES.SERVER.RUNNING} ${PORT}`));
  })
  .catch((err) => console.error(MESSAGES.SERVER.DB_FAILED, err.message));
