import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { toggle, followers, following } from '../controllers/follow.controller';

const router = Router();

router.use(authMiddleware);

//! seguir / dejar de seguir
router.post('/:userId', toggle);

//! ver seguidores
router.get('/:userId/followers', followers);

//! ver seguidos
router.get('/:userId/following', following);

export default router;
