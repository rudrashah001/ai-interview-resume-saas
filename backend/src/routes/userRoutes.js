import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { updateProfile, getDashboard } from '../controllers/userController.js';

const router = Router();

router.use(protect);
router.get('/dashboard', getDashboard);
router.patch(
  '/profile',
  body('name').optional().trim().notEmpty(),
  validateRequest,
  updateProfile
);

export default router;
