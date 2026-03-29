import { prisma } from '../config/prisma';

export const createComment = async (
    petId: number,
    postId: number,
    content: string,
) => {
    return prisma.comment.create({
        data: {
            content,
            petId,
            postId,
        },
    });
};

export const getCommentsByPost = async (postId: number) => {
    return prisma.comment.findMany({
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
