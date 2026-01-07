import { prisma } from '../config/prisma';

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
    data: { name?: string; bio?: string; image?: string }
) => {
    const pet = await prisma.pet.findFirst({
        where: { id: petId, ownerId },
    });

    if (!pet) {
        throw new Error(
            'Pet not found or you do not have permission to update it.'
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
        throw new Error('Pet not found');
    }

    await prisma.pet.delete({
        where: { id: petId },
    });
};
