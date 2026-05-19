import Resume from '../models/Resume.js';
import ResumeTemplate from '../models/ResumeTemplate.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { deleteStoredFile, storeResumeUpload } from '../utils/fileStorage.js';
import { chatCompletion } from '../utils/openaiClient.js';
import { hasFullAccess } from '../utils/access.js';

export const listResumes = asyncHandler(async (req, res) => {
  const items = await Resume.find({ user: req.user._id }).sort({
    updatedAt: -1,
  });
  res.json(items);
});

export const getResume = asyncHandler(async (req, res) => {
  const doc = await Resume.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!doc) {
    res.status(404);
    throw new Error('Resume not found');
  }
  res.json(doc);
});

export const createResume = asyncHandler(async (req, res) => {
  const body = { ...req.body, user: req.user._id };
  const doc = await Resume.create(body);
  res.status(201).json(doc);
});

export const updateResume = asyncHandler(async (req, res) => {
  const doc = await Resume.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!doc) {
    res.status(404);
    throw new Error('Resume not found');
  }
  res.json(doc);
});

export const deleteResume = asyncHandler(async (req, res) => {
  const doc = await Resume.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!doc) {
    res.status(404);
    throw new Error('Resume not found');
  }
  await deleteStoredFile(doc.resumeFile?.publicId);
  res.json({ message: 'Deleted' });
});

export const uploadResumeAsset = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }
  const resume = await Resume.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!resume) {
    res.status(404);
    throw new Error('Resume not found');
  }
  if (resume.resumeFile?.publicId) {
    await deleteStoredFile(resume.resumeFile.publicId);
  }
  let stored;
  try {
    stored = await storeResumeUpload(req.file, {
      userId: String(req.user._id),
      resumeId: String(resume._id),
    });
  } catch (e) {
    res.status(502);
    throw new Error(e.message || 'Upload failed');
  }
  resume.resumeFile = { url: stored.url, publicId: stored.publicId };
  await resume.save();
  res.json(resume);
});

export const aiResumeSummary = asyncHandler(async (req, res) => {
  const { role, bullets, tone } = req.body;
  const prompt = `Write a concise professional summary (2-3 sentences) for a resume. Role focus: ${role || 'general'}. Key points: ${bullets || ''}. Tone: ${tone || 'confident and clear'}. No fluff.`;
  const text = await chatCompletion([{ role: 'user', content: prompt }]);
  res.json({ summary: text });
});

const parseAiJson = (raw) => {
  try {
    return JSON.parse(raw.replace(/```json\n?|\n?```/g, '').trim());
  } catch {
    return null;
  }
};

export const aiAnalyzeResume = asyncHandler(async (req, res) => {
  const { text, jobTarget } = req.body;
  if (!text || text.length < 40) {
    res.status(400);
    throw new Error('Paste resume text (at least 40 characters)');
  }
  const prompt = `Analyze this resume for clarity, impact, and relevance${
    jobTarget ? ` for roles like: ${jobTarget}` : ''
  }. Return JSON only:
{"score":0-100,"strengths":["..."],"improvements":["..."],"suggestions":["actionable bullet improvements"],"summary":"one paragraph"}
Resume text:
---
${text.slice(0, 12000)}
---`;
  const raw = await chatCompletion([{ role: 'user', content: prompt }], {
    temperature: 0.3,
    max_tokens: 1500,
  });
  const parsed = parseAiJson(raw);
  if (!parsed) {
    res.status(502);
    throw new Error('Could not parse AI analysis');
  }
  res.json({ tier: 'basic', ...parsed });
});

export const aiAnalyzeResumeAdvanced = asyncHandler(async (req, res) => {
  const { text, jobTarget, industry } = req.body;
  if (!text || text.length < 40) {
    res.status(400);
    throw new Error('Paste resume text (at least 40 characters)');
  }
  const prompt = `You are an ATS and senior recruiter expert. Analyze resume${
    jobTarget ? ` for: ${jobTarget}` : ''
  }${industry ? ` in ${industry} industry` : ''}.
Return JSON only:
{"score":0-100,"atsScore":0-100,"strengths":["..."],"improvements":["..."],"optimizationTips":["..."],"keywordGaps":["..."],"industryTips":["..."],"rewriteSuggestions":[{"section":"...","before":"...","after":"..."}],"summary":"paragraph"}
Resume:
---
${text.slice(0, 12000)}
---`;
  const raw = await chatCompletion([{ role: 'user', content: prompt }], {
    temperature: 0.25,
    max_tokens: 2500,
  });
  const parsed = parseAiJson(raw);
  if (!parsed) {
    res.status(502);
    throw new Error('Could not parse advanced analysis');
  }
  res.json({ tier: 'advanced', ...parsed });
});

export const aiRewriteResume = asyncHandler(async (req, res) => {
  const { text, jobTarget, tone } = req.body;
  const prompt = `Rewrite this resume content to be stronger, quantified, and ATS-friendly${
    jobTarget ? ` for ${jobTarget}` : ''
  }. Tone: ${tone || 'professional'}. Return JSON: {"rewrittenText":"full improved text","highlights":["what changed"]}
Original:
${(text || '').slice(0, 10000)}`;
  const raw = await chatCompletion([{ role: 'user', content: prompt }], {
    max_tokens: 3000,
  });
  const parsed = parseAiJson(raw);
  if (!parsed?.rewrittenText) {
    res.status(502);
    throw new Error('Could not parse rewrite');
  }
  res.json(parsed);
});

export const aiGenerateCoverLetter = asyncHandler(async (req, res) => {
  const { resumeText, jobTitle, company, highlights } = req.body;
  const prompt = `Write a tailored cover letter. Job: ${jobTitle}. Company: ${company}. Highlights: ${highlights || ''}. Resume context: ${(resumeText || '').slice(0, 4000)}. Return JSON: {"coverLetter":"..."}`;
  const raw = await chatCompletion([{ role: 'user', content: prompt }], {
    max_tokens: 2000,
  });
  const parsed = parseAiJson(raw);
  res.json(parsed || { coverLetter: raw });
});

export const aiGenerateLinkedIn = asyncHandler(async (req, res) => {
  const { resumeText, name, headline } = req.body;
  const prompt = `Create a LinkedIn About section and headline. Name: ${name}. Headline hint: ${headline}. Resume: ${(resumeText || '').slice(0, 4000)}. Return JSON: {"headline":"...","about":"..."}`;
  const raw = await chatCompletion([{ role: 'user', content: prompt }], {
    max_tokens: 1200,
  });
  res.json(parseAiJson(raw) || { about: raw });
});

export const aiGeneratePortfolio = asyncHandler(async (req, res) => {
  const { projects, skills, role } = req.body;
  const prompt = `Write portfolio project descriptions for a ${role || 'developer'}. Projects: ${JSON.stringify(projects || [])}. Skills: ${(skills || []).join(', ')}. Return JSON: {"descriptions":[{"title":"...","description":"..."}]}`;
  const raw = await chatCompletion([{ role: 'user', content: prompt }], {
    max_tokens: 1500,
  });
  res.json(parseAiJson(raw) || { descriptions: [] });
});

export const listTemplates = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const filter = hasFullAccess(user)
    ? { isActive: true }
    : { isActive: true, isPremium: false };
  const templates = await ResumeTemplate.find(filter).sort({ name: 1 }).lean();
  res.json(templates);
});

export const aiResumeSkills = asyncHandler(async (req, res) => {
  const { role, experienceSnippet } = req.body;
  const prompt = `Suggest 10-14 relevant technical and soft skills as a JSON array of strings only, no markdown. Role: ${role}. Context: ${experienceSnippet || ''}`;
  const text = await chatCompletion([{ role: 'user', content: prompt }], {
    temperature: 0.4,
  });
  let skills = [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) skills = parsed.map(String);
  } catch {
    skills = text
      .split(/[,\n]/)
      .map((s) => s.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean)
      .slice(0, 14);
  }
  res.json({ skills });
});
