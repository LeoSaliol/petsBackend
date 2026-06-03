import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
    getConversationByIdController,
    getConversations,
    deleteConversationController,
    createConversation,
    sendMessageController,
    getUnreadMessagesCountController,
    markConversationAsReadController,
} from '../controllers/conversation.controller';

const router = Router();

router.post('/', authMiddleware, createConversation);
router.get('/', authMiddleware, getConversations);
router.get('/unread/count', authMiddleware, getUnreadMessagesCountController);
router.get('/:id', authMiddleware, getConversationByIdController);
router.put('/:id/read', authMiddleware, markConversationAsReadController);
router.delete('/:id', authMiddleware, deleteConversationController);
router.post('/:id/messages', authMiddleware, sendMessageController);

export default router;
