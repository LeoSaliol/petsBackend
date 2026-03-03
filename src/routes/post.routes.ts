import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { create, feed, postsByPet } from '../controllers/post.controller';

const router = Router();

router.use(authMiddleware);

router.post('/', create);
router.get('/feed', feed);
router.get('/pet/:petId', postsByPet);

export default router;
