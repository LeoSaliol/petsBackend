import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
    getConversationByIdController,
    getConversations,
} from '../controllers/conversation.controller';

const router = Router();

router.get('/', authMiddleware, getConversations);
router.get('/:id', authMiddleware, getConversationByIdController);

export default router;
