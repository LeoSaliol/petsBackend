import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { byPost, toggle } from '../controllers/like.controller';

const router = Router();

router.use(authMiddleware);

router.post('/:postId', byPost);
router.post('/toggle/:postId', toggle);

export default router;
