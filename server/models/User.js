// User model: admins, officers, students and teachers. Passwords are hashed automatically before saving.
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, SECURITY, values } from '../config/constants.js';
import { MESSAGES } from '../config/messages.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, MESSAGES.VALIDATION.NAME_REQUIRED], trim: true },
    email: {
      type: String,
      required: [true, MESSAGES.VALIDATION.EMAIL_REQUIRED],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, MESSAGES.VALIDATION.EMAIL_INVALID],
    },
    password: {
      type: String,
      required: [true, MESSAGES.VALIDATION.PASSWORD_REQUIRED],
      minlength: [6, MESSAGES.VALIDATION.PASSWORD_SHORT],
      select: false, // never returned in queries unless asked for
    },
    role: { type: String, enum: values(ROLES), default: ROLES.STUDENT },
    // Only officers belong to a department.
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [function () { return this.role === ROLES.OFFICER; }, MESSAGES.VALIDATION.DEPARTMENT_REQUIRED_OFFICER],
    },
    rollNo: { type: String, trim: true, sparse: true, unique: true },     // students
    employeeId: { type: String, trim: true, sparse: true, unique: true }, // staff / teachers
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash the password whenever it is new or changed.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, SECURITY.BCRYPT_ROUNDS);
  next();
});

// Compare a plain password with the stored hash.
userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('User', userSchema);
