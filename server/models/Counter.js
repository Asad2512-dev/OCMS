// Counter model: keeps a running number per year so complaint IDs (CMP-2026-0001) never repeat.
import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. "complaint-2026"
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

// Atomically increases and returns the next number for the given key.
export const nextSequence = async (key) => {
  const doc = await Counter.findByIdAndUpdate(key, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return doc.seq;
};

export default Counter;
