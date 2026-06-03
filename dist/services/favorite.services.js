"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavorites = exports.toggleFavorite = void 0;
const prisma_1 = require("../config/prisma");
const toggleFavorite = async (petId, postId) => {
    const existing = await prisma_1.prisma.favorite.findUnique({
        where: { petId_postId: { petId, postId } },
    });
    if (existing) {
        await prisma_1.prisma.favorite.delete({ where: { id: existing.id } });
        return { favorited: false };
    }
    await prisma_1.prisma.favorite.create({
        data: { petId, postId },
    });
    return { favorited: true };
};
exports.toggleFavorite = toggleFavorite;
const getFavorites = async (petId) => {
    const favorites = await prisma_1.prisma.favorite.findMany({
        where: { petId },
        orderBy: { createdAt: 'desc' },
        include: {
            post: {
                include: {
                    pet: {
                        select: { id: true, name: true, image: true },
                    },
                    _count: { select: { likes: true, comments: true } },
                },
            },
        },
    });
    return favorites.map((f) => ({
        ...f.post,
        likedByUser: false,
        favoritedByUser: true,
    }));
};
exports.getFavorites = getFavorites;
