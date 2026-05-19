import { asyncHandler } from '../utils/asyncHandler.js';
import { chatCompletion } from '../utils/openaiClient.js';
import { FEATURED_COMPANIES } from '../config/features.js';

const parseJson = (raw) => {
  try {
    return JSON.parse(raw.replace(/```json\n?|\n?```/g, '').trim());
  } catch {
    return null;
  }
};

export const getFeaturedCompanies = asyncHandler(async (req, res) => {
  res.json({ companies: FEATURED_COMPANIES });
});

export const companyRoadmap = asyncHandler(async (req, res) => {
  const { company, jobTitle, experienceLevel } = req.body;
  const prompt = `Create an interview preparation roadmap for ${jobTitle || 'Software Engineer'} at ${company}. Experience: ${experienceLevel || 'mid-level'}. Return JSON:
{"phases":[{"title":"...","duration":"...","topics":["..."],"resources":["..."]}],"tips":["..."],"timelineWeeks":number}`;
  const raw = await chatCompletion([{ role: 'user', content: prompt }], {
    max_tokens: 2000,
  });
  res.json(parseJson(raw) || { phases: [], tips: [raw] });
});

export const careerGuidance = asyncHandler(async (req, res) => {
  const { goals, background, constraints } = req.body;
  const prompt = `Provide personalized career guidance. Goals: ${goals}. Background: ${background}. Constraints: ${constraints || 'none'}. Return JSON: {"shortTerm":["..."],"longTerm":["..."],"skillsToBuild":["..."],"networking":["..."],"summary":"..."}`;
  const raw = await chatCompletion([{ role: 'user', content: prompt }], {
    max_tokens: 1500,
  });
  res.json(parseJson(raw) || { summary: raw });
});

export const skillGapAnalysis = asyncHandler(async (req, res) => {
  const { currentSkills, targetRole, jobDescription } = req.body;
  const prompt = `Skill gap analysis. Current: ${(currentSkills || []).join(', ')}. Target role: ${targetRole}. JD: ${(jobDescription || '').slice(0, 3000)}. Return JSON: {"gaps":[{"skill":"...","priority":"high|medium|low","learningPath":"..."}],"strengths":["..."],"score":0-100}`;
  const raw = await chatCompletion([{ role: 'user', content: prompt }], {
    max_tokens: 1500,
  });
  res.json(parseJson(raw) || { gaps: [] });
});

export const jobRecommendations = asyncHandler(async (req, res) => {
  const { skills, experience, preferences, location } = req.body;
  const prompt = `Suggest 8 job roles/titles matching profile. Skills: ${(skills || []).join(', ')}. Experience: ${experience}. Preferences: ${preferences}. Location: ${location || 'remote-friendly'}. Return JSON: {"roles":[{"title":"...","matchScore":0-100,"why":"...","companies":["..."]}]}`;
  const raw = await chatCompletion([{ role: 'user', content: prompt }], {
    max_tokens: 1500,
  });
  res.json(parseJson(raw) || { roles: [] });
});

export const mockInterview = asyncHandler(async (req, res) => {
  const { jobTitle, company, difficulty, transcript } = req.body;
  const prompt = `You are conducting a mock interview for ${jobTitle} at ${company || 'a tech company'}. Difficulty: ${difficulty || 'medium'}.
Candidate transcript so far:
${(transcript || 'Starting interview.').slice(0, 6000)}
Return JSON: {"interviewerMessage":"next question or follow-up","evaluation":"brief assessment of last answer if any","score":0-100,"tips":["..."]}`;
  const raw = await chatCompletion([{ role: 'user', content: prompt }], {
    temperature: 0.5,
    max_tokens: 1200,
  });
  res.json(parseJson(raw) || { interviewerMessage: raw });
});
