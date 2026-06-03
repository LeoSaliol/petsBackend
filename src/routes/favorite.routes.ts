import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { toggle, list } from '../controllers/favorite.controller';

const router = Router();

router.use(authMiddleware);
router.post('/toggle/:postId', toggle);
router.get('/', list);

export default router;
