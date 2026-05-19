import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiters.js';
import { checkChatLimit } from '../middleware/usageLimits.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  listConversations,
  getConversation,
  createConversation,
  sendMessage,
  deleteConversation,
} from '../controllers/chatController.js';

const router = Router();
router.use(protect);

router.get('/', listConversations);
router.post('/', createConversation);
router.get('/:id', getConversation);
router.post(
  '/:id/messages',
  aiLimiter,
  checkChatLimit,
  body('content').trim().notEmpty(),
  validateRequest,
  sendMessage
);
router.delete('/:id', deleteConversation);

export default router;
