import { prisma } from '../config/prisma';

export const createComment = async (
    userId: number,
    postId: number,
    content: string,
) => {
    return prisma.comment.create({
        data: {
            content,
            userId,
            postId,
        },
    });
};

export const getCommentsByPost = async (postId: number) => {
    return prisma.comment.findMany({
        where: { postId },
        orderBy: { createdAt: 'asc' },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
};
