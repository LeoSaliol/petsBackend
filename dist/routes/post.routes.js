"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../config/prisma");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const post_controller_1 = require("../controllers/post.controller");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = (0, express_1.Router)();
router.get('/feed', post_controller_1.feed);
router.get('/all', async (req, res, next) => {
    try {
        const petId = req.query.petId ? Number(req.query.petId) : undefined;
        const posts = await prisma_1.prisma.post.findMany({
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
        let likedByUserMap = {};
        let favoritedByUserMap = {};
        if (petId) {
            const [userLikes, userFavorites] = await Promise.all([
                prisma_1.prisma.like.findMany({
                    where: { petId, postId: { in: posts.map(p => p.id) } },
                    select: { postId: true },
                }),
                prisma_1.prisma.favorite.findMany({
                    where: { petId, postId: { in: posts.map(p => p.id) } },
                    select: { postId: true },
                }),
            ]);
            likedByUserMap = Object.fromEntries(userLikes.map(l => [l.postId, true]));
            favoritedByUserMap = Object.fromEntries(userFavorites.map(f => [f.postId, true]));
        }
        const data = posts.map(post => ({
            ...post,
            likedByUser: likedByUserMap[post.id] || false,
            favoritedByUser: favoritedByUserMap[post.id] || false,
        }));
        res.json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
});
router.get('/pet/:petId', post_controller_1.postsByPet);
router.use(auth_middleware_1.authMiddleware);
router.get('/:id', post_controller_1.getPost);
router.post('/', upload_middleware_1.postImage.single('image'), post_controller_1.create);
router.delete('/:id', post_controller_1.remove);
router.put('/:id', upload_middleware_1.postImage.single('image'), post_controller_1.update);
exports.default = router;
