import { Router } from 'express';
import { body } from 'express-validator';
import { protect, requirePremium } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiters.js';
import { trackResumeDownload } from '../middleware/usageLimits.js';
import { uploadResumeFile } from '../middleware/upload.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  listResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
  uploadResumeAsset,
  aiResumeSummary,
  aiResumeSkills,
  aiAnalyzeResume,
  aiAnalyzeResumeAdvanced,
  aiRewriteResume,
  aiGenerateCoverLetter,
  aiGenerateLinkedIn,
  aiGeneratePortfolio,
  listTemplates,
} from '../controllers/resumeController.js';

const router = Router();
router.use(protect);

router.get('/', listResumes);
router.get('/templates', listTemplates);

router.post(
  '/ai/analyze',
  aiLimiter,
  body('text').isString().isLength({ min: 40 }),
  body('jobTarget').optional().isString(),
  validateRequest,
  aiAnalyzeResume
);

router.post(
  '/ai/summary',
  aiLimiter,
  requirePremium,
  body('role').optional().isString(),
  body('bullets').optional().isString(),
  validateRequest,
  aiResumeSummary
);
router.post(
  '/ai/skills',
  aiLimiter,
  requirePremium,
  body('role').optional().isString(),
  body('experienceSnippet').optional().isString(),
  validateRequest,
  aiResumeSkills
);
router.post(
  '/ai/analyze/advanced',
  aiLimiter,
  requirePremium,
  body('text').isString().isLength({ min: 40 }),
  validateRequest,
  aiAnalyzeResumeAdvanced
);
router.post('/ai/rewrite', aiLimiter, requirePremium, aiRewriteResume);
router.post('/ai/cover-letter', aiLimiter, requirePremium, aiGenerateCoverLetter);
router.post('/ai/linkedin', aiLimiter, requirePremium, aiGenerateLinkedIn);
router.post('/ai/portfolio', aiLimiter, requirePremium, aiGeneratePortfolio);

router.post('/:id/track-download', trackResumeDownload, (req, res) =>
  res.json({ ok: true })
);

router.post('/', createResume);
router.get('/:id', getResume);
router.put('/:id', updateResume);
router.delete('/:id', deleteResume);
router.post(
  '/:id/upload',
  uploadResumeFile.single('file'),
  uploadResumeAsset
);

export default router;
