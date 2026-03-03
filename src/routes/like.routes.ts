import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { byPost } from '../controllers/like.controller';

const router = Router();

router.use(authMiddleware);

router.post('/:postId', byPost);

export default router;
