import { prisma } from '../config/prisma';
import { HttpError } from '../utils/httpError';

export const toggleFollow = async (followerId: number, followingId: number) => {
    if (followerId === followingId) {
        throw new HttpError('You cannot follow yourself', 400);
    }

    const existing = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId,
                followingId,
            },
        },
    });

    if (existing) {
        await prisma.follow.delete({
            where: { id: existing.id },
        });
        return { following: false };
    }

    await prisma.follow.create({
        data: {
            followerId,
            followingId,
        },
    });

    return { following: true };
};

export const getFollowers = async (userId: number) => {
    return prisma.follow.findMany({
        where: { followingId: userId },
        include: {
            follower: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
};

export const getFollowing = async (userId: number) => {
    return prisma.follow.findMany({
        where: { followerId: userId },
        include: {
            following: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
};
