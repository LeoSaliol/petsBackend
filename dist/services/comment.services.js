"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommentsByPost = exports.createComment = void 0;
const prisma_1 = require("../config/prisma");
const notifications_services_1 = require("./notifications.services");
const createComment = async (petId, postId, content) => {
    const post = await prisma_1.prisma.post.findUnique({
        where: { id: postId },
        include: {
            pet: true,
        },
    });
    if (!post)
        throw new Error('Post no encontrado');
    const comment = await prisma_1.prisma.comment.create({
        data: {
            content,
            petId,
            postId,
        },
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
    if (post.pet.id !== petId) {
        const actor = await prisma_1.prisma.pet.findUnique({
            where: { id: petId },
        });
        await (0, notifications_services_1.createNotification)(post.pet.id, actor?.id || 0, 'COMMENT', postId);
    }
    return comment;
};
exports.createComment = createComment;
const getCommentsByPost = async (postId) => {
    return prisma_1.prisma.comment.findMany({
        where: { postId },
        orderBy: { createdAt: 'asc' },
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
exports.getCommentsByPost = getCommentsByPost;
