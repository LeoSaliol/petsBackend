import { prisma } from '../config/prisma';

import { HttpError } from '../utils/httpError';

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

    await prisma.pet.delete({
        where: { id: petId },
    });
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
