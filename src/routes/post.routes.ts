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
import { attachPet } from '../middlewares/attachPet';

const router = Router();

router.get('/feed', feed);
router.get('/pet/:petId', postsByPet);
router.use(authMiddleware, attachPet);

router.post('/', postImage.single('image'), create);
router.delete('/:id', remove);
router.put('/:id', postImage.single('image'), update);
export default router;
