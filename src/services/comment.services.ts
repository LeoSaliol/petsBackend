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

export const updateComment = async (
    commentId: number,
    petId: number,
    content: string,
) => {
    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
    });
    if (!comment) throw new Error('Comentario no encontrado');
    if (comment.petId !== petId) throw new Error('No tienes permiso para editar este comentario');

    return prisma.comment.update({
        where: { id: commentId },
        data: { content },
        include: {
            pet: {
                select: { id: true, name: true, image: true },
            },
        },
    });
};

export const deleteComment = async (commentId: number, petId: number) => {
    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
    });
    if (!comment) throw new Error('Comentario no encontrado');
    if (comment.petId !== petId) throw new Error('No tienes permiso para eliminar este comentario');

    await prisma.comment.delete({ where: { id: commentId } });
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
