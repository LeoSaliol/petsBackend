import cloudinary, { getPublicIdFromUrl } from '../config/cloudinary';
import { prisma } from '../config/prisma';
import { HttpError } from '../utils/httpError';

export const createPost = async (
    petId: number,
    ownerId: number,
    content?: string,

    image?: string,
) => {
    //-- verifica que la mascota sea del usuario
    const pet = await prisma.pet.findFirst({
        where: { id: petId, ownerId },
    });

    if (!pet) {
        throw new HttpError('Pet not found or not yours', 400);
    }

    return prisma.post.create({
        data: {
            content,
            image: image!,
            petId,
        },
    });
};

export const getFeed = async (cursor?: string, petId?: number) => {
    const posts = await prisma.post.findMany({
        take: 10,

        ...(cursor && {
            skip: 1,
            cursor: {
                id: Number(cursor),
            },
        }),

        orderBy: {
            createdAt: 'desc',
        },

        include: {
            pet: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },

            _count: {
                select: {
                    likes: true,
                    comments: true,
                },
            },
            likes: {
                where: {
                    petId: petId,
                },
                select: {
                    petId: true,
                },
            },
        },
    });

    return posts;
};

export const getPostsByPet = async (petId: number) => {
    return prisma.post.findMany({
        where: { petId },
        orderBy: { createdAt: 'desc' },
    });
};

export const deletePost = async (postId: number) => {
    const post = await prisma.post.findUnique({
        where: { id: postId },
    });
    if (!post) {
        throw new HttpError('Post not found', 404);
    }
    const publicId = getPublicIdFromUrl(post.image);
    await cloudinary.uploader.destroy(publicId);
    await prisma.post.delete({
        where: { id: postId },
    });
    return { message: 'Post deleted' };
};

export const updatePost = async (
    postId: number,
    content?: string,
    image?: string,
) => {
    const post = await prisma.post.findUnique({
        where: { id: postId },
    });

    if (!post) {
        throw new Error('Post not found');
    }

    if (image) {
        const publicId = getPublicIdFromUrl(post.image);

        await cloudinary.uploader.destroy(publicId);
    }

    const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
            content,
            image: image ?? post.image,
        },
    });

    return updatedPost;
};
