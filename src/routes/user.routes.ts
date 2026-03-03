import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { profile } from '../controllers/user.controller';

const router = Router();

router.get('/:userId/profile', authMiddleware, profile);

export default router;
