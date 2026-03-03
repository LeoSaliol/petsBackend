import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { create, byPost } from '../controllers/comment.controller';

const router = Router();

router.use(authMiddleware);

router.post('/:postId', create);
router.get('/:postId', byPost);

export default router;
