import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
    create,
    feed,
    postsByPet,
    remove,
    update,
} from '../controllers/post.controller';
import { postImage } from '../middlewares/upload.middleware';

const router = Router();

router.get('/feed', feed);
router.use(authMiddleware);

router.post('/', postImage.single('image'), create);
router.get('/pet/:petId', postsByPet);
router.delete('/:id', remove);
router.put('/:id', postImage.single('image'), update);
export default router;
