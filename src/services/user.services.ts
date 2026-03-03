import { prisma } from '../config/prisma';
import { HttpError } from '../utils/httpError';

export const getProfile = async (
    profileUserId: number,
    currentUserId: number,
) => {
    const user = await prisma.user.findUnique({
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

    if (!user) {
        throw new HttpError('User not found', 404);
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
        id: user.id,
        name: user.name,
        followersCount: user._count.followers,
        followingCount: user._count.following,
        isFollowing: !!isFollowing,
    };
};
