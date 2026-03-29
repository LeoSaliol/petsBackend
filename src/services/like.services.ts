import { prisma } from '../config/prisma';

export const toggleLike = async (petId: number, postId: number) => {
    //* Quitar el like si ya existe, o agregarlo si no existe

    const existingLike = await prisma.like.findUnique({
        where: {
            petId_postId: {
                petId,
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
            postId,
            petId,
        },
    });

    return { liked: true };
};

export const getLikesByPost = async (postId: number) => {
    return prisma.like.findMany({
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
