import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
    create,
    feed,
    postsByPet,
    remove,
    update,
} from '../controllers/post.controller';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', upload.single('image'), create);
router.get('/feed', feed);
router.get('/pet/:petId', postsByPet);
router.delete('/:id', remove);
router.put('/:id', upload.single('image'), update);
export default router;
