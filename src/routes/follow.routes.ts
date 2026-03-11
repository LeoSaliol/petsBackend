import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { toggle, followers, following } from '../controllers/follow.controller';

const router = Router();

router.use(authMiddleware);

//! seguir / dejar de seguir
router.post('/:petId', toggle);

//! ver seguidores
router.get('/:petId/followers', followers);

//! ver seguidos
router.get('/:petId/following', following);

export default router;
