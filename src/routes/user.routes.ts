import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { profile, updateProfile, deleteAccount } from '../controllers/user.controller';
import { attachPet } from '../middlewares/attachPet';
import { petImage } from '../middlewares/upload.middleware';

const router = Router();

router.get('/:userId/profile', profile);
router.put('/:userId', authMiddleware, petImage.single('image'), updateProfile);
router.delete('/me', authMiddleware, deleteAccount);

export default router;
