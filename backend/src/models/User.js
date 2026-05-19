import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const subscriptionSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['none', 'active', 'past_due', 'canceled', 'trialing'],
      default: 'none',
    },
    plan: { type: String, default: 'free' },
    stripeCustomerId: { type: String, default: null },
    stripeSubscriptionId: { type: String, default: null },
    currentPeriodEnd: { type: Date, default: null },
  },
  { _id: false }
);

const usageSchema = new mongoose.Schema(
  {
    resumeDownloads: { type: Number, default: 0 },
    downloadsMonthKey: { type: String, default: '' },
    chatMessagesToday: { type: Number, default: 0 },
    chatDayKey: { type: String, default: '' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    subscription: { type: subscriptionSchema, default: () => ({}) },
    usage: { type: usageSchema, default: () => ({}) },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function matchPassword(entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.isPremium = function isPremium() {
  const sub = this.subscription;
  if (!sub || sub.status !== 'active') return false;
  if (sub.currentPeriodEnd && sub.currentPeriodEnd < new Date()) return false;
  return true;
};

userSchema.methods.hasFullAccess = function hasFullAccess() {
  return this.role === 'admin' || this.isPremium();
};

export default mongoose.model('User', userSchema);
