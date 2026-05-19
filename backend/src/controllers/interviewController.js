import InterviewSession from '../models/InterviewSession.js';
import InterviewQuestionBank from '../models/InterviewQuestionBank.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { chatCompletion } from '../utils/openaiClient.js';
import { FEATURED_COMPANIES, LIMITS } from '../config/features.js';
import { hasFullAccess, getLimits } from '../utils/access.js';

export const listSessions = asyncHandler(async (req, res) => {
  const items = await InterviewSession.find({ user: req.user._id }).sort({
    updatedAt: -1,
  });
  res.json(items);
});

export const getSession = asyncHandler(async (req, res) => {
  const doc = await InterviewSession.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!doc) {
    res.status(404);
    throw new Error('Session not found');
  }
  res.json(doc);
});

export const createSession = asyncHandler(async (req, res) => {
  const { jobTitle, company, difficulty } = req.body;
  const doc = await InterviewSession.create({
    user: req.user._id,
    jobTitle,
    company,
    difficulty: difficulty || 'medium',
    items: [],
  });
  res.status(201).json(doc);
});

export const getCompanies = asyncHandler(async (req, res) => {
  res.json({ companies: FEATURED_COMPANIES });
});

export const searchCompanyQuestions = asyncHandler(async (req, res) => {
  const { company, category, difficulty, limit = 20 } = req.query;
  if (!company) {
    res.status(400);
    throw new Error('Company is required');
  }
  const cap = Math.min(parseInt(limit, 10) || 20, 100);
  const filter = {
    isActive: true,
    company: new RegExp(company.trim(), 'i'),
  };
  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;
  const items = await InterviewQuestionBank.find(filter).limit(cap).lean();
  res.json({ company, count: items.length, items });
});

export const generateQuestions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const limits = getLimits(user);
  const doc = await InterviewSession.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!doc) {
    res.status(404);
    throw new Error('Session not found');
  }
  const { mix = 'both', count: requestedCount } = req.body;
  let techCount = mix === 'hr' ? 0 : 5;
  let hrCount = mix === 'technical' ? 0 : 4;
  if (requestedCount) {
    const total = Math.min(
      parseInt(requestedCount, 10) || 10,
      limits.maxQuestionsPerBatch
    );
    if (mix === 'technical') {
      techCount = total;
      hrCount = 0;
    } else if (mix === 'hr') {
      hrCount = total;
      techCount = 0;
    } else {
      techCount = Math.ceil(total * 0.55);
      hrCount = total - techCount;
    }
  }

  const bankSamples = doc.company
    ? await InterviewQuestionBank.find({
        isActive: true,
        company: new RegExp(doc.company, 'i'),
        difficulty: doc.difficulty,
      })
        .limit(Math.min(techCount + hrCount, 30))
        .lean()
    : [];

  const bankItems = bankSamples.map((q) => ({
    question: q.question,
    category: q.category === 'hr' || q.category === 'behavioral' ? 'hr' : 'technical',
    answer: '',
    feedback: '',
  }));

  let aiItems = [];
  if (techCount + hrCount > 0) {
    const prompt = `You are an interview coach. Job: ${doc.jobTitle}. Company: ${doc.company || 'general tech'}. Difficulty: ${doc.difficulty}.
Return JSON only:
{"technical":[{"question":"...","category":"technical"}],"hr":[{"question":"...","category":"hr"}]}
Include exactly ${techCount} technical and ${hrCount} HR/behavioral questions. Use company-specific style when company is known.`;

    const raw = await chatCompletion([{ role: 'user', content: prompt }], {
      temperature: 0.6,
      max_tokens: Math.min(4000, 200 + (techCount + hrCount) * 80),
    });

    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, '').trim());
    } catch {
      res.status(502);
      throw new Error('Failed to parse AI response');
    }

    aiItems = [
      ...(parsed.technical || []).map((q) => ({
        question: q.question,
        category: 'technical',
        answer: '',
        feedback: '',
      })),
      ...(parsed.hr || []).map((q) => ({
        question: q.question,
        category: 'hr',
        answer: '',
        feedback: '',
      })),
    ];
  }

  const merged = [...bankItems, ...aiItems].slice(0, limits.maxQuestionsPerBatch);
  if (!hasFullAccess(user)) {
    const existing = doc.items?.length || 0;
    const maxSaved = LIMITS.free.maxSavedQuestions;
    if (existing + merged.length > maxSaved) {
      res.status(402);
      throw new Error(
        `Free plan saves up to ${maxSaved} questions. Upgrade for unlimited.`
      );
    }
  }

  doc.items = merged.length ? merged : doc.items;
  await doc.save();
  res.json(doc);
});

export const saveAnswer = asyncHandler(async (req, res) => {
  const { itemId, answer } = req.body;
  const doc = await InterviewSession.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!doc) {
    res.status(404);
    throw new Error('Session not found');
  }
  const item = doc.items.id(itemId);
  if (!item) {
    res.status(404);
    throw new Error('Question not found');
  }
  item.answer = answer;
  await doc.save();
  res.json(doc);
});

export const feedbackForAnswer = asyncHandler(async (req, res) => {
  const { itemId } = req.body;
  const doc = await InterviewSession.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!doc) {
    res.status(404);
    throw new Error('Session not found');
  }
  const item = doc.items.id(itemId);
  if (!item) {
    res.status(404);
    throw new Error('Question not found');
  }
  if (!item.answer?.trim()) {
    res.status(400);
    throw new Error('Answer is required for feedback');
  }

  const prompt = `You are a hiring manager. Question (${item.category}): ${item.question}
Candidate answer: ${item.answer}
Difficulty target: ${doc.difficulty}
Give concise feedback: strengths, gaps, and a model outline (bullet points). Keep under 200 words.`;

  const feedback = await chatCompletion([{ role: 'user', content: prompt }]);
  item.feedback = feedback;
  await doc.save();
  res.json(doc);
});

export const deleteSession = asyncHandler(async (req, res) => {
  const doc = await InterviewSession.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!doc) {
    res.status(404);
    throw new Error('Session not found');
  }
  res.json({ message: 'Deleted' });
});
