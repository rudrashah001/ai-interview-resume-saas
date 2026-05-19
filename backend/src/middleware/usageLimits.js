import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getLimits, hasFullAccess, resetUsageIfNeeded } from '../utils/access.js';

export const trackResumeDownload = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (hasFullAccess(user)) return next();
  resetUsageIfNeeded(user.usage);
  const limits = getLimits(user);
  if (user.usage.resumeDownloads >= limits.resumeDownloadsPerMonth) {
    res.status(402);
    throw new Error(
      `Free plan allows ${limits.resumeDownloadsPerMonth} downloads per month. Upgrade for unlimited.`
    );
  }
  user.usage.resumeDownloads += 1;
  await user.save();
  next();
});

export const checkChatLimit = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (hasFullAccess(user)) {
    req.user = user;
    return next();
  }
  resetUsageIfNeeded(user.usage);
  const limits = getLimits(user);
  if (user.usage.chatMessagesToday >= limits.chatMessagesPerDay) {
    res.status(429);
    throw new Error(
      `Daily chat limit (${limits.chatMessagesPerDay}) reached. Upgrade for unlimited access.`
    );
  }
  req.user = user;
  next();
});

export const incrementChatUsage = async (user) => {
  resetUsageIfNeeded(user.usage);
  user.usage.chatMessagesToday += 1;
  await user.save();
};
