"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchPets = exports.getAllPets = exports.getPetById = exports.getPerfilPet = exports.deletePet = exports.updatePet = exports.getMyPets = exports.createPet = void 0;
const prisma_1 = require("../config/prisma");
const httpError_1 = require("../utils/httpError");
const createPet = async ({ name, bio, image, ownerId, }) => {
    return await prisma_1.prisma.pet.create({
        data: {
            name,
            bio,
            image,
            ownerId,
        },
    });
};
exports.createPet = createPet;
const getMyPets = async (ownerId) => {
    return await prisma_1.prisma.pet.findMany({
        where: { ownerId },
    });
};
exports.getMyPets = getMyPets;
const updatePet = async (petId, ownerId, data) => {
    const pet = await prisma_1.prisma.pet.findFirst({
        where: { id: petId, ownerId },
    });
    if (!pet) {
        throw new httpError_1.HttpError('Pet not found or you do not have permission to update it.', 400);
    }
    return await prisma_1.prisma.pet.update({
        where: { id: petId },
        data,
    });
};
exports.updatePet = updatePet;
const deletePet = async (petId, ownerId) => {
    const pet = await prisma_1.prisma.pet.findFirst({
        where: { id: petId, ownerId },
    });
    if (!pet) {
        throw new httpError_1.HttpError('Pet not found', 404);
    }
    await prisma_1.prisma.pet.delete({
        where: { id: petId },
    });
};
exports.deletePet = deletePet;
const getPerfilPet = async (petId) => {
    const pet = await prisma_1.prisma.pet.findUnique({
        where: { id: petId },
        include: {
            posts: {
                select: {
                    id: true,
                    image: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            },
            _count: {
                select: {
                    followers: true,
                    following: true,
                    posts: true,
                },
            },
        },
    });
    if (!pet) {
        throw new httpError_1.HttpError('Pet not found', 404);
    }
    return pet;
};
exports.getPerfilPet = getPerfilPet;
const getPetById = async (petId, currentPetId) => {
    const pet = await prisma_1.prisma.pet.findUnique({
        where: { id: petId },
        include: {
            _count: {
                select: {
                    followers: true,
                    following: true,
                    posts: true,
                },
            },
        },
    });
    if (!pet) {
        throw new httpError_1.HttpError('Pet not found', 404);
    }
    let isFollowing = false;
    if (currentPetId && currentPetId !== petId) {
        const follow = await prisma_1.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentPetId,
                    followingId: petId,
                },
            },
        });
        isFollowing = !!follow;
    }
    return {
        ...pet,
        followersCount: pet._count.followers,
        followingCount: pet._count.following,
        postsCount: pet._count.posts,
        isFollowing,
    };
};
exports.getPetById = getPetById;
const getAllPets = async () => {
    return await prisma_1.prisma.pet.findMany({
        include: {
            _count: {
                select: {
                    followers: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};
exports.getAllPets = getAllPets;
const searchPets = async (query) => {
    return await prisma_1.prisma.pet.findMany({
        where: {
            name: {
                contains: query,
                mode: 'insensitive',
            },
        },
        include: {
            _count: {
                select: {
                    followers: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: 20,
    });
};
exports.searchPets = searchPets;
