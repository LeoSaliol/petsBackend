import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { toggle, followers, following } from '../controllers/follow.controller';
import { attachPet } from '../middlewares/attachPet';

const router = Router();

router.use(authMiddleware, attachPet);

//! seguir / dejar de seguir
router.post('/:petId', toggle);

//! ver seguidores
router.get('/:petId/followers', followers);

//! ver seguidos
router.get('/:petId/following', following);

export default router;
