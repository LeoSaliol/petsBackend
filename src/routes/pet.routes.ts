import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { create, myPets, update, remove } from '../controllers/pet.controller';

const router = Router();

router.use(authMiddleware);

router.post('/', create);
router.get('/me', myPets);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
