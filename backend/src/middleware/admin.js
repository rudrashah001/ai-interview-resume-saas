import { asyncHandler } from '../utils/asyncHandler.js';

export const requireAdmin = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Admin access only');
  }
  next();
});
