import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiters.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Min 8 characters'),
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

router.post('/register', authLimiter, validateRegister, validateRequest, register);
router.post('/login', authLimiter, validateLogin, validateRequest, login);
router.get('/me', protect, getMe);
router.post(
  '/forgot-password',
  authLimiter,
  body('email').isEmail().normalizeEmail(),
  validateRequest,
  forgotPassword
);
router.post(
  '/reset-password',
  authLimiter,
  body('token').notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  validateRequest,
  resetPassword
);

export default router;
