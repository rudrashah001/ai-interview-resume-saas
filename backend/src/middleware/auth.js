import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { hasFullAccess } from '../utils/access.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    token = auth.split(' ')[1];
  }
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      res.status(401);
      throw new Error('User not found');
    }
    next();
  } catch {
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

export const requirePremium = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!hasFullAccess(user)) {
    res.status(402);
    throw new Error('Premium subscription required');
  }
  req.user = user;
  next();
});
