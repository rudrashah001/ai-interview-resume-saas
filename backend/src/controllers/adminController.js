import User from '../models/User.js';
import Resume from '../models/Resume.js';
import InterviewSession from '../models/InterviewSession.js';
import ChatConversation from '../models/ChatConversation.js';
import PaymentEvent from '../models/PaymentEvent.js';
import InterviewQuestionBank from '../models/InterviewQuestionBank.js';
import ResumeTemplate from '../models/ResumeTemplate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);
  const skip = (page - 1) * limit;
  const filter = {};
  if (req.query.q) {
    filter.$or = [
      { name: new RegExp(req.query.q, 'i') },
      { email: new RegExp(req.query.q, 'i') },
    ];
  }
  const [items, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('name email role subscription createdAt'),
    User.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.role = role;
  await user.save();
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const [
    userCount,
    premiumCount,
    resumeCount,
    interviewCount,
    chatCount,
    signupsByDay,
    revenueAgg,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ 'subscription.status': 'active' }),
    Resume.countDocuments(),
    InterviewSession.countDocuments(),
    ChatConversation.countDocuments(),
    User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    PaymentEvent.aggregate([
      {
        $match: {
          type: 'payment_succeeded',
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const totalRevenue = await PaymentEvent.aggregate([
    { $match: { type: 'payment_succeeded' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  res.json({
    totals: {
      users: userCount,
      premiumUsers: premiumCount,
      resumes: resumeCount,
      interviews: interviewCount,
      chats: chatCount,
      revenue: totalRevenue[0]?.total || 0,
    },
    signupsLast30Days: signupsByDay,
    revenueLast30Days: revenueAgg,
  });
});

export const updateUserSubscription = asyncHandler(async (req, res) => {
  const { status, plan, currentPeriodEnd } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (status) user.subscription.status = status;
  if (plan) user.subscription.plan = plan;
  if (currentPeriodEnd) {
    user.subscription.currentPeriodEnd = new Date(currentPeriodEnd);
  }
  await user.save();
  res.json({
    _id: user._id,
    subscription: user.subscription,
    isPremium: user.isPremium(),
  });
});

export const listPayments = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 30);
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    PaymentEvent.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .lean(),
    PaymentEvent.countDocuments(),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

export const listQuestionBank = asyncHandler(async (req, res) => {
  const items = await InterviewQuestionBank.find()
    .sort({ company: 1, createdAt: -1 })
    .limit(200)
    .lean();
  res.json(items);
});

export const createQuestionBank = asyncHandler(async (req, res) => {
  const doc = await InterviewQuestionBank.create(req.body);
  res.status(201).json(doc);
});

export const updateQuestionBank = asyncHandler(async (req, res) => {
  const doc = await InterviewQuestionBank.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!doc) {
    res.status(404);
    throw new Error('Question not found');
  }
  res.json(doc);
});

export const deleteQuestionBank = asyncHandler(async (req, res) => {
  const doc = await InterviewQuestionBank.findByIdAndDelete(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error('Question not found');
  }
  res.json({ message: 'Deleted' });
});

export const listTemplatesAdmin = asyncHandler(async (req, res) => {
  const items = await ResumeTemplate.find().sort({ name: 1 }).lean();
  res.json(items);
});

export const upsertTemplate = asyncHandler(async (req, res) => {
  const { id, ...body } = req.body;
  if (id) {
    const doc = await ResumeTemplate.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    return res.json(doc);
  }
  const doc = await ResumeTemplate.create(body);
  res.status(201).json(doc);
});

export const deleteTemplate = asyncHandler(async (req, res) => {
  const doc = await ResumeTemplate.findByIdAndDelete(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error('Template not found');
  }
  res.json({ message: 'Deleted' });
});
