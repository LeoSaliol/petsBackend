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

export const getFollowers = async (petId: number, cursor?: number) => {
    const followers = await prisma.follow.findMany({
        where: {
            followingId: petId,
        },

        take: 10,

        ...(cursor && {
            skip: 1,
            cursor: {
                id: cursor,
            },
        }),

        include: {
            follower: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },
        },

        orderBy: {
            id: 'desc',
        },
    });

    return followers;
};

export const getFollowing = async (petId: number, cursor?: number) => {
    const following = await prisma.follow.findMany({
        where: {
            followerId: petId,
        },

        take: 10,

        ...(cursor && {
            skip: 1,
            cursor: {
                id: cursor,
            },
        }),

        include: {
            following: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },
        },

        orderBy: {
            id: 'desc',
        },
    });

    return following;
};
