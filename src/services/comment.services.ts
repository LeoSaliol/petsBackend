import { prisma } from '../config/prisma';
import { createNotification } from './notifications.services';

export const createComment = async (
    petId: number,
    postId: number,
    content: string,
) => {
    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
            pet: true,
        },
    });
    if (!post) throw new Error('Post no encontrado');

    const comment = await prisma.comment.create({
        data: {
            content,
            petId,
            postId,
        },
    });
    if (post.pet.id !== petId) {
        const actor = await prisma.pet.findUnique({
            where: { id: petId },
        });

        await createNotification(
            post.pet.id,
            actor?.id || 0,
            'COMMENT',
            postId,
        );
    }
    return comment;
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
