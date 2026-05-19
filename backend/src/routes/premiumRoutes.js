import { Router } from 'express';
import { body } from 'express-validator';
import { protect, requirePremium } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiters.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  getFeaturedCompanies,
  companyRoadmap,
  careerGuidance,
  skillGapAnalysis,
  jobRecommendations,
  mockInterview,
} from '../controllers/premiumController.js';

const router = Router();

router.get('/companies', protect, getFeaturedCompanies);

router.use(protect, requirePremium, aiLimiter);

router.post(
  '/roadmap',
  body('company').trim().notEmpty(),
  validateRequest,
  companyRoadmap
);
router.post('/career-guidance', careerGuidance);
router.post('/skill-gap', skillGapAnalysis);
router.post('/job-recommendations', jobRecommendations);
router.post('/mock-interview', mockInterview);

export default router;
