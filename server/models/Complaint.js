// Complaint model: the core record. Gets an auto ID like CMP-2026-0001 and tracks remarks and status history.
import mongoose from 'mongoose';
import { STATUSES, PRIORITIES, CATEGORIES, ANONYMOUS_ALLOWED_ROLES, COMPLAINT_ID, values } from '../config/constants.js';
import { MESSAGES } from '../config/messages.js';
import { nextSequence } from './Counter.js';

const { ObjectId } = mongoose.Schema.Types;

const remarkSchema = new mongoose.Schema(
  { by: { type: ObjectId, ref: 'User' }, text: { type: String, required: true, trim: true }, date: { type: Date, default: Date.now } },
  { _id: true }
);

const historySchema = new mongoose.Schema(
  { status: { type: String, enum: values(STATUSES) }, by: { type: ObjectId, ref: 'User' }, date: { type: Date, default: Date.now } },
  { _id: false }
);

const attachmentSchema = new mongoose.Schema(
  { url: String, filename: String, mimetype: String, size: Number },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    complaintId: { type: String, unique: true },
    title: { type: String, required: [true, MESSAGES.VALIDATION.TITLE_REQUIRED], trim: true },
    description: { type: String, required: [true, MESSAGES.VALIDATION.DESCRIPTION_REQUIRED], trim: true },
    category: { type: String, enum: values(CATEGORIES), default: CATEGORIES.OTHER },
    attachments: [attachmentSchema],
    submittedBy: { type: ObjectId, ref: 'User', required: true },
    isAnonymous: { type: Boolean, default: false },
    department: { type: ObjectId, ref: 'Department' },
    assignedTo: { type: ObjectId, ref: 'User' },
    priority: { type: String, enum: values(PRIORITIES), default: PRIORITIES.NORMAL },
    status: { type: String, enum: values(STATUSES), default: STATUSES.PENDING },
    remarks: [remarkSchema],
    statusHistory: [historySchema],
  },
  { timestamps: true }
);

// Builds "CMP-2026-0001" style IDs.
const buildComplaintId = async () => {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`complaint-${year}`);
  return `${COMPLAINT_ID.PREFIX}-${year}-${String(seq).padStart(COMPLAINT_ID.PAD, '0')}`;
};

// Only teachers may be anonymous.
const checkAnonymous = async (doc) => {
  if (!doc.isAnonymous) return;
  const user = await mongoose.model('User').findById(doc.submittedBy).select('role');
  if (!user || !ANONYMOUS_ALLOWED_ROLES.includes(user.role)) {
    const err = new Error(MESSAGES.VALIDATION.ANONYMOUS_NOT_ALLOWED);
    err.statusCode = 400;
    throw err;
  }
};

complaintSchema.pre('save', async function (next) {
  try {
    if (this.isNew) {
      await checkAnonymous(this);
      this.complaintId = await buildComplaintId();
      if (!this.statusHistory.length) this.statusHistory.push({ status: this.status, by: this.submittedBy });
    }
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model('Complaint', complaintSchema);
