"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLikesByPost = exports.toggleLike = void 0;
const prisma_1 = require("../config/prisma");
const notifications_services_1 = require("./notifications.services");
const toggleLike = async (petId, postId) => {
    //* Quitar el like si ya existe, o agregarlo si no existe
    const post = await prisma_1.prisma.post.findUnique({
        where: { id: postId },
        include: {
            pet: true, // dueño del post
        },
    });
    if (!post) {
        throw new Error('Post no encontrado');
    }
    const existingLike = await prisma_1.prisma.like.findUnique({
        where: {
            petId_postId: {
                petId,
                postId,
            },
        },
    });
    if (existingLike) {
        await prisma_1.prisma.like.delete({
            where: { id: existingLike.id },
        });
        return { liked: false, petId };
    }
    await prisma_1.prisma.like.create({
        data: {
            postId,
            petId,
        },
    });
    if (post.pet.id !== petId) {
        const actor = await prisma_1.prisma.pet.findUnique({
            where: { id: petId },
        });
        await (0, notifications_services_1.createNotification)(post.pet.id, // receptor
        actor?.id || 0, 'LIKE', postId);
    }
    return { liked: true, petId, post };
};
exports.toggleLike = toggleLike;
const getLikesByPost = async (postId) => {
    return prisma_1.prisma.like.findMany({
        where: { postId },
        include: {
            pet: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },
        },
    });
};
exports.getLikesByPost = getLikesByPost;
