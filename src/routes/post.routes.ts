import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
    create,
    feed,
    getPost,
    postsByPet,
    remove,
    update,
} from '../controllers/post.controller';
import { postImage } from '../middlewares/upload.middleware';
import { attachPet } from '../middlewares/attachPet';

const router = Router();

router.get('/feed', feed);
router.get('/all', async (req, res, next) => {
    try {
        const petId = req.query.petId ? Number(req.query.petId) : undefined;

        const posts = await prisma.post.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
            include: {
                pet: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
        });

        let likedByUserMap: Record<number, boolean> = {};
        let favoritedByUserMap: Record<number, boolean> = {};
        if (petId) {
            const [userLikes, userFavorites] = await Promise.all([
                prisma.like.findMany({
                    where: { petId, postId: { in: posts.map(p => p.id) } },
                    select: { postId: true },
                }),
                prisma.favorite.findMany({
                    where: { petId, postId: { in: posts.map(p => p.id) } },
                    select: { postId: true },
                }),
            ]);
            likedByUserMap = Object.fromEntries(
                userLikes.map(l => [l.postId, true]),
            );
            favoritedByUserMap = Object.fromEntries(
                userFavorites.map(f => [f.postId, true]),
            );
        }

        const data = posts.map(post => ({
            ...post,
            likedByUser: likedByUserMap[post.id] || false,
            favoritedByUser: favoritedByUserMap[post.id] || false,
        }));

        res.json({ success: true, data });
    } catch (error: any) {
        next(error);
    }
});
router.get('/pet/:petId', postsByPet);
router.use(authMiddleware);
router.get('/:id', getPost);
router.post('/', postImage.single('image'), create);
router.delete('/:id', remove);
router.put('/:id', postImage.single('image'), update);
export default router;
