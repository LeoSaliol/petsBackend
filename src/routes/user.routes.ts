import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { profile } from '../controllers/user.controller';
import { attachPet } from '../middlewares/attachPet';

const router = Router();

router.get('/:userId/profile', profile);

export default router;
