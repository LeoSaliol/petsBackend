import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { create, myPets, update, remove, getById, selectPet } from '../controllers/pet.controller';
import { petImage } from '../middlewares/upload.middleware';
import { attachPet } from '../middlewares/attachPet';

const router = Router();

router.get('/explore', async (_req, res, next) => {
  try {
    const { getAllPets } = await import('../services/pet.services');
    const pets = await getAllPets();
    res.json(pets);
  } catch (error) {
    next(error);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const { searchPets } = await import('../services/pet.services');
    const query = (req.query.q as string) || '';
    if (!query.trim()) {
      res.json([]);
      return;
    }
    const pets = await searchPets(query);
    res.json(pets);
  } catch (error) {
    next(error);
  }
});

router.use(authMiddleware, attachPet);

router.post('/select/:petId', selectPet);
router.get('/me', myPets);
router.get('/:id', getById);
router.post('/', petImage.single('image'), create);
router.put('/:id', petImage.single('image'), update);
router.delete('/:id', remove);

export default router;