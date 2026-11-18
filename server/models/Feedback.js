// Feedback model: a 1–5 star rating and comment a user leaves on a resolved complaint.
import mongoose from 'mongoose';
import { RATING } from '../config/constants.js';
import { MESSAGES } from '../config/messages.js';

const feedbackSchema = new mongoose.Schema(
  {
    complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: {
      type: Number,
      required: true,
      min: [RATING.MIN, MESSAGES.VALIDATION.RATING_RANGE],
      max: [RATING.MAX, MESSAGES.VALIDATION.RATING_RANGE],
    },
    comment: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

// One feedback per user per complaint.
feedbackSchema.index({ complaint: 1, user: 1 }, { unique: true });

export default mongoose.model('Feedback', feedbackSchema);
