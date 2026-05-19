import User from '../models/User.js';
import Resume from '../models/Resume.js';
import InterviewSession from '../models/InterviewSession.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  await user.save();
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

export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const [user, resumeCount, interviewCount, recentResumes, recentInterviews] =
    await Promise.all([
      User.findById(userId),
      Resume.countDocuments({ user: userId }),
      InterviewSession.countDocuments({ user: userId }),
      Resume.find({ user: userId }).sort({ updatedAt: -1 }).limit(5).lean(),
      InterviewSession.find({ user: userId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean(),
    ]);

  res.json({
    profile: {
      name: user.name,
      email: user.email,
      subscription: user.subscription,
      isPremium: user.isPremium(),
      hasFullAccess: user.hasFullAccess(),
    },
    stats: { resumeCount, interviewCount },
    recentResumes,
    recentInterviews,
  });
});
