import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { create, myPets, update, remove } from '../controllers/pet.controller';
import { petImage } from '../middlewares/upload.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', petImage.single('image'), create);
router.get('/me', myPets);
router.put('/:id', petImage.single('image'), update);
router.delete('/:id', remove);

export default router;
