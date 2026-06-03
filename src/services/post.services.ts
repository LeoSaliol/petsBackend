import cloudinary, { getPublicIdFromUrl } from '../config/cloudinary';
import { prisma } from '../config/prisma';
import { HttpError } from '../utils/httpError';

export const getPostById = async (postId: number) => {
    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
            likes: {
                select: {
                    petId: true,
                },
            },
            pet: true,
            _count: { select: { likes: true, comments: true } },
        },
    });
    if (!post) {
        throw new HttpError('Post not found', 404);
    }
    return post;
};

export const createPost = async (
    petId: number,
    ownerId: number,
    content?: string,
    image?: string,
    location?: string,
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
            location,
        },
    });
};

export const getFeed = async (cursor?: string, petId?: number) => {
    let petIds: number[] = [];

    if (petId) {
        const pet = await prisma.pet.findUnique({
            where: { id: petId },
            include: {
                following: {
                    select: { followingId: true },
                },
            },
        });

        if (pet) {
            const followingIds = pet.following.map((f) => f.followingId);
            petIds = [petId, ...followingIds];
        }
    }

    const posts = await prisma.post.findMany({
        take: 10,

        ...(cursor && {
            skip: 1,
            cursor: {
                id: Number(cursor),
            },
        }),

        ...(petIds.length > 0 && {
            where: {
                petId: {
                    in: petIds,
                },
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
            ...(petId && {
                likes: {
                    where: { petId },
                    select: { petId: true },
                },
                favorites: {
                    where: { petId },
                    select: { petId: true },
                },
            }),
        },
    });

    return posts.map((post) => ({
        ...post,
        likedByUser: petId ? post.likes?.some((like) => like.petId === petId) : false,
        favoritedByUser: petId ? post.favorites?.some((f) => f.petId === petId) : false,
    }));
};

export const getPostsByPet = async (petId: number, requestingPetId?: number) => {
    const posts = await prisma.post.findMany({
        where: { petId },
        orderBy: { createdAt: 'desc' },
        include: {
            pet: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },
            _count: { select: { likes: true, comments: true } },
            ...(requestingPetId && {
                likes: {
                    where: { petId: requestingPetId },
                    select: { petId: true },
                },
                favorites: {
                    where: { petId: requestingPetId },
                    select: { petId: true },
                },
            }),
        },
    });

    return posts.map((post) => ({
        id: post.id,
        image: post.image,
        content: post.content,
        description: post.description,
        location: post.location,
        createdAt: post.createdAt,
        petId: post.petId,
        pet: post.pet,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
        isLiked: requestingPetId ? post.likes?.some((l: any) => l.petId === requestingPetId) : false,
        isFavorited: requestingPetId ? post.favorites?.some((f: any) => f.petId === requestingPetId) : false,
    }));
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
    location?: string,
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
            location: location ?? post.location,
        },
    });

    return updatedPost;
};
