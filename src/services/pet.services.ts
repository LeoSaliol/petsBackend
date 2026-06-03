import { prisma } from '../config/prisma';
import { HttpError } from '../utils/httpError';
import cloudinary, { getPublicIdFromUrl } from '../config/cloudinary';

interface CreatePetInput {
    name: string;
    bio?: string;
    image?: string;
    ownerId: number;
}

export const createPet = async ({
    name,
    bio,
    image,
    ownerId,
}: CreatePetInput) => {
    return await prisma.pet.create({
        data: {
            name,
            bio,
            image,
            ownerId,
        },
    });
};

export const getMyPets = async (ownerId: number) => {
    return await prisma.pet.findMany({
        where: { ownerId },
    });
};

export const updatePet = async (
    petId: number,
    ownerId: number,
    data: { name?: string; bio?: string; image?: string },
) => {
    const pet = await prisma.pet.findFirst({
        where: { id: petId, ownerId },
    });

    if (!pet) {
        throw new HttpError(
            'Pet not found or you do not have permission to update it.',
            400,
        );
    }

    return await prisma.pet.update({
        where: { id: petId },
        data,
    });
};

export const deletePet = async (petId: number, ownerId: number) => {
    const pet = await prisma.pet.findFirst({
        where: { id: petId, ownerId },
    });

    if (!pet) {
        throw new HttpError('Pet not found', 404);
    }

    const petPosts = await prisma.post.findMany({
        where: { petId },
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

    await prisma.notification.deleteMany({ where: { petId } });
    await prisma.follow.deleteMany({
        where: {
            OR: [{ followerId: petId }, { followingId: petId }],
        },
    });
    await prisma.post.deleteMany({ where: { petId } });
    await prisma.pet.delete({ where: { id: petId } });
};

export const getPerfilPet = async (petId: number) => {
    const pet = await prisma.pet.findUnique({
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
        throw new HttpError('Pet not found', 404);
    }

    return pet;
};

export const getPetById = async (petId: number, currentPetId?: number) => {
    const pet = await prisma.pet.findUnique({
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
        throw new HttpError('Pet not found', 404);
    }

    let isFollowing = false;
    if (currentPetId && currentPetId !== petId) {
        const follow = await prisma.follow.findUnique({
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

export const getAllPets = async () => {
    return await prisma.pet.findMany({
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

export const searchPets = async (query: string) => {
    return await prisma.pet.findMany({
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
