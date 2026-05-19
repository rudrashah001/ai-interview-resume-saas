import ChatConversation from '../models/ChatConversation.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { chatCompletion } from '../utils/openaiClient.js';
import { hasFullAccess } from '../utils/access.js';
import { incrementChatUsage } from '../middleware/usageLimits.js';

export const listConversations = asyncHandler(async (req, res) => {
  const items = await ChatConversation.find({ user: req.user._id })
    .sort({ updatedAt: -1 })
    .select('title updatedAt createdAt');
  res.json(items);
});

export const getConversation = asyncHandler(async (req, res) => {
  const doc = await ChatConversation.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!doc) {
    res.status(404);
    throw new Error('Conversation not found');
  }
  res.json(doc);
});

export const createConversation = asyncHandler(async (req, res) => {
  const doc = await ChatConversation.create({
    user: req.user._id,
    title: req.body.title || 'New chat',
    messages: [],
  });
  res.status(201).json(doc);
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  let doc = await ChatConversation.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!doc) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  doc.messages.push({ role: 'user', content });
  const history = doc.messages.slice(-20).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const system = {
    role: 'system',
    content:
      'You are a concise career coach for interview prep and resumes. Give actionable, structured answers.',
  };

  const user = await User.findById(req.user._id);
  const maxTokens = hasFullAccess(user) ? 1800 : 1200;

  const reply = await chatCompletion([system, ...history], {
    max_tokens: maxTokens,
  });

  if (!hasFullAccess(user)) {
    await incrementChatUsage(user);
  }

  doc.messages.push({ role: 'assistant', content: reply });
  if (doc.title === 'New chat' && content.length < 80) {
    doc.title = content.slice(0, 72) + (content.length > 72 ? '…' : '');
  }
  await doc.save();
  res.json(doc);
});

export const deleteConversation = asyncHandler(async (req, res) => {
  const doc = await ChatConversation.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!doc) {
    res.status(404);
    throw new Error('Conversation not found');
  }
  res.json({ message: 'Deleted' });
});
