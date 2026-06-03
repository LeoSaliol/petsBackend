"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFollowing = exports.getFollowers = exports.toggleFollow = void 0;
const prisma_1 = require("../config/prisma");
const httpError_1 = require("../utils/httpError");
const notifications_services_1 = require("./notifications.services");
const toggleFollow = async (followerId, followingId) => {
    if (followerId === followingId) {
        throw new httpError_1.HttpError('You cannot follow yourself', 400);
    }
    const existing = await prisma_1.prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId,
                followingId,
            },
        },
    });
    if (existing) {
        await prisma_1.prisma.follow.delete({
            where: { id: existing.id },
        });
        return { following: false };
    }
    await prisma_1.prisma.follow.create({
        data: {
            followerId,
            followingId,
        },
    });
    if (followerId !== followingId) {
        const actor = await prisma_1.prisma.pet.findUnique({
            where: { id: followerId },
        });
        await (0, notifications_services_1.createNotification)(followingId, actor?.id || 0, 'FOLLOW');
    }
    return { following: true };
};
exports.toggleFollow = toggleFollow;
const getFollowers = async (petId, cursor) => {
    const followers = await prisma_1.prisma.follow.findMany({
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
exports.getFollowers = getFollowers;
const getFollowing = async (petId, cursor) => {
    const following = await prisma_1.prisma.follow.findMany({
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
exports.getFollowing = getFollowing;
