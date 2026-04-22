import { prisma } from '../config/prisma';
import { createNotification } from './notifications.services';

export const toggleLike = async (petId: number, postId: number) => {
    //* Quitar el like si ya existe, o agregarlo si no existe

    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
            pet: true, // dueño del post
        },
    });

    if (!post) {
        throw new Error('Post no encontrado');
    }

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

        return { liked: false, petId };
    }

    await prisma.like.create({
        data: {
            postId,
            petId,
        },
    });
    if (post.pet.id !== petId) {
        const actor = await prisma.pet.findUnique({
            where: { id: petId },
        });

        await createNotification(
            post.pet.id, // receptor
            actor?.id || 0,
            'LIKE',
            postId,
        );
    }
    return { liked: true, petId, post };
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
