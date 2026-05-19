import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  listUsers,
  updateUserRole,
  getAnalytics,
  updateUserSubscription,
  listPayments,
  listQuestionBank,
  createQuestionBank,
  updateQuestionBank,
  deleteQuestionBank,
  listTemplatesAdmin,
  upsertTemplate,
  deleteTemplate,
} from '../controllers/adminController.js';

const router = Router();

router.use(protect, requireAdmin);

router.get('/users', listUsers);
router.patch(
  '/users/:id/role',
  body('role').isIn(['user', 'admin']),
  validateRequest,
  updateUserRole
);
router.patch('/users/:id/subscription', updateUserSubscription);
router.get('/analytics', getAnalytics);
router.get('/payments', listPayments);

router.get('/questions', listQuestionBank);
router.post('/questions', createQuestionBank);
router.patch('/questions/:id', updateQuestionBank);
router.delete('/questions/:id', deleteQuestionBank);

router.get('/templates', listTemplatesAdmin);
router.post('/templates', upsertTemplate);
router.delete('/templates/:id', deleteTemplate);

export default router;
