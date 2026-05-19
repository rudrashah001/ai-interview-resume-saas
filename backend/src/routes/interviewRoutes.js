import { Router } from 'express';
import { body } from 'express-validator';
import { protect, requirePremium } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiters.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  listSessions,
  getSession,
  createSession,
  generateQuestions,
  saveAnswer,
  feedbackForAnswer,
  deleteSession,
  getCompanies,
  searchCompanyQuestions,
} from '../controllers/interviewController.js';

const router = Router();
router.use(protect);

router.get('/', listSessions);
router.get('/companies', getCompanies);
router.get('/questions/search', searchCompanyQuestions);

router.post(
  '/',
  body('jobTitle').trim().notEmpty(),
  body('company').optional().isString(),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
  validateRequest,
  createSession
);

router.get('/:id', getSession);
router.post(
  '/:id/questions',
  aiLimiter,
  body('mix').optional().isIn(['technical', 'hr', 'both']),
  body('count').optional().isInt({ min: 1, max: 500 }),
  validateRequest,
  generateQuestions
);
router.patch(
  '/:id/answer',
  body('itemId').notEmpty(),
  body('answer').isString(),
  validateRequest,
  saveAnswer
);
router.post(
  '/:id/feedback',
  aiLimiter,
  requirePremium,
  body('itemId').notEmpty(),
  validateRequest,
  feedbackForAnswer
);
router.delete('/:id', deleteSession);

export default router;
