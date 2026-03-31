import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { create, byPost } from '../controllers/comment.controller';
import { attachPet } from '../middlewares/attachPet';

const router = Router();

router.get('/:postId', byPost);
router.use(authMiddleware, attachPet);

router.post('/:postId', create);

export default router;
