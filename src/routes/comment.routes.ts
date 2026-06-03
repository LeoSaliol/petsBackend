import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { create, update, remove, byPost } from '../controllers/comment.controller';
import { attachPet } from '../middlewares/attachPet';

const router = Router();

router.get('/:postId', byPost);
router.use(authMiddleware, attachPet);

router.post('/:postId', create);
router.put('/:commentId', update);
router.delete('/:commentId', remove);

export default router;
