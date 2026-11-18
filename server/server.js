// Entry point of the backend: loads .env, connects to MongoDB, then starts listening.
import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { MESSAGES } from './config/messages.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(MESSAGES.SERVER.RUNNING, PORT));
  } catch (err) {
    console.error(MESSAGES.SERVER.DB_FAILED, err.message);
    process.exit(1);
  }
};

start();
