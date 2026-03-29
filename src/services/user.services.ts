import { prisma } from '../config/prisma';
import { HttpError } from '../utils/httpError';

export const getProfile = async (
    profileUserId: number,
    currentUserId: number,
) => {
    const pet = await prisma.pet.findUnique({
        where: { id: profileUserId },
        select: {
            id: true,
            name: true,
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

    const isFollowing = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: currentUserId,
                followingId: profileUserId,
            },
        },
    });

    return {
        id: pet.id,
        name: pet.name,
        followersCount: pet._count.followers,
        followingCount: pet._count.following,
        isFollowing: !!isFollowing,
    };
};
