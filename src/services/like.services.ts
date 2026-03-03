import { prisma } from '../config/prisma';

export const toggleLike = async (userId: number, postId: number) => {
    //* Quitar el like si ya existe, o agregarlo si no existe
    const existingLike = await prisma.like.findUnique({
        where: {
            userId_postId: {
                userId,
                postId,
            },
        },
    });

    if (existingLike) {
        await prisma.like.delete({
            where: { id: existingLike.id },
        });

        return { liked: false };
    }

    await prisma.like.create({
        data: {
            userId,
            postId,
        },
    });

    return { liked: true };
};

export const getLikesByPost = async (postId: number) => {
    return prisma.like.findMany({
        where: { postId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
};
