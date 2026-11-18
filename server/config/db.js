// Connects to MongoDB using MONGO_URI from the .env file.
import mongoose from 'mongoose';
import { MESSAGES } from './messages.js';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error(MESSAGES.SERVER.MISSING_MONGO_URI);
  const conn = await mongoose.connect(uri);
  console.log(MESSAGES.SERVER.DB_CONNECTED, conn.connection.host);
  return conn;
};
