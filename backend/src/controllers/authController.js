import crypto from 'crypto';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken } from '../utils/generateToken.js';
import { sendPasswordResetEmail } from '../utils/sendEmail.js';

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('Email already registered');
  }
  const user = await User.create({ name, email, password });
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    subscription: user.subscription,
    isPremium: user.isPremium(),
    hasFullAccess: user.hasFullAccess(),
    token: signToken(user._id),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    subscription: user.subscription,
    isPremium: user.isPremium(),
    hasFullAccess: user.hasFullAccess(),
    token: signToken(user._id),
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    subscription: user.subscription,
    isPremium: user.isPremium(),
    hasFullAccess: user.hasFullAccess(),
    usage: user.usage,
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({
      message: 'If an account exists, a reset link has been sent.',
    });
  }
  const raw = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = hashToken(raw);
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const base = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${base}/reset-password?token=${raw}&email=${encodeURIComponent(email)}`;
  await sendPasswordResetEmail(user.email, resetUrl);

  res.json({ message: 'If an account exists, a reset link has been sent.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, email, password } = req.body;
  const user = await User.findOne({
    email,
    resetPasswordToken: hashToken(token),
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+password +resetPasswordToken +resetPasswordExpire');

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired token');
  }
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res.json({ message: 'Password updated. You can sign in now.' });
});
