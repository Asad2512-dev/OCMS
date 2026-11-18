// Department model: a university office that handles complaints (e.g. Hostel, Library).
import mongoose from 'mongoose';
import { MESSAGES } from '../config/messages.js';

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, MESSAGES.VALIDATION.NAME_REQUIRED], unique: true, trim: true },
    description: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Department', departmentSchema);
