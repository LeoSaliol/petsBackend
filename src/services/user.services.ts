import { is } from 'zod/v4/locales';
import { prisma } from '../config/prisma';
import { HttpError } from '../utils/httpError';
import { update } from '../controllers/pet.controller';
import cloudinary, { getPublicIdFromUrl } from '../config/cloudinary';

export const getProfile = async (
    profileUserId: number,
    currentUserId?: number,
) => {
    const pet = await prisma.pet.findUnique({
        where: { id: profileUserId },
        select: {
            id: true,
            ownerId: true,
            name: true,
            image: true,
            bio: true,
            createdAt: true,
            posts: {
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    image: true,
                    content: true,
                    createdAt: true,
                    _count: {
                        select: { comments: true, likes: true },
                    },
                },
            },
            _count: {
                select: {
                    followers: true,
                    following: true,
                },
            },
        },
    });

    if (!pet) {
        throw new HttpError('Pet not found', 404);
    }

    let isFollowing = false;

    if (currentUserId) {
        const follow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: profileUserId,
                },
            },
        });

        isFollowing = !!follow;
    }

    return {
        id: pet.id,
        ownerId: pet.ownerId,
        name: pet.name,
        followersCount: pet._count.followers,
        followingCount: pet._count.following,
        isFollowing,
        image: pet.image,
        bio: pet.bio,
        createdAt: pet.createdAt,
        posts: pet.posts,
    };
};

export const updateProfileService = async (
    profileUserId: number,
    updateData: any,
) => {
    const { image } = updateData;
    const pet = await prisma.pet.findUnique({
        where: { id: profileUserId },
    });

    if (!pet) {
        throw new HttpError('Pet not found', 404);
    }
    if (image && pet.image) {
        const publicId = getPublicIdFromUrl(pet.image);

        await cloudinary.uploader.destroy(publicId);
    }
    const updatedPet = await prisma.pet.update({
        where: { id: profileUserId },
        data: {
            ...updateData,
            image: image ? image : pet.image,
        },
    });
    return updatedPet;
};

export const deleteUserAccountService = async (userId: number) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { pets: true },
    });

    if (!user) {
        throw new HttpError('User not found', 404);
    }

    for (const pet of user.pets) {
        const petPosts = await prisma.post.findMany({
            where: { petId: pet.id },
            select: { id: true, image: true },
        });

        for (const post of petPosts) {
            if (post.image) {
                const publicId = getPublicIdFromUrl(post.image);
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId).catch(() => {});
                }
            }
        }

        await prisma.notification.deleteMany({ where: { petId: pet.id } });

        await prisma.follow.deleteMany({
            where: {
                OR: [{ followerId: pet.id }, { followingId: pet.id }],
            },
        });

        await prisma.post.deleteMany({ where: { petId: pet.id } });

        await prisma.pet.delete({ where: { id: pet.id } });
    }

    await prisma.notification.deleteMany({ where: { userId } });

    const orphanConversations = await prisma.conversation.findMany({
        where: {
            participants: { none: {} },
        },
    });

    for (const conv of orphanConversations) {
        await prisma.conversation.delete({ where: { id: conv.id } });
    }

    await prisma.user.delete({ where: { id: userId } });

    return { success: true };
};
