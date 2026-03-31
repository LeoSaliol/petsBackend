import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { byPost, toggle } from '../controllers/like.controller';
import { attachPet } from '../middlewares/attachPet';

const router = Router();

router.use(authMiddleware, attachPet);

router.post('/:postId', byPost);
router.post('/toggle/:postId', toggle);

export default router;
