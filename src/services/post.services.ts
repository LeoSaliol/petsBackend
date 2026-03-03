import { prisma } from '../config/prisma';
import { HttpError } from '../utils/httpError';

export const createPost = async (
    petId: number,
    ownerId: number,
    content?: string,
    image?: string,
) => {
    //-- verifica que la mascota sea del usuario
    const pet = await prisma.pet.findFirst({
        where: { id: petId, ownerId },
    });

    if (!pet) {
        throw new HttpError('Pet not found or not yours', 400);
    }

    return prisma.post.create({
        data: {
            content,
            image: image!,
            petId,
        },
    });
};

export const getFeed = async () => {
    return prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            pet: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },
            _count: {
                select: {
                    likes: true,
                    comments: true,
                },
            },
        },
    });
};

export const getPostsByPet = async (petId: number) => {
    return prisma.post.findMany({
        where: { petId },
        orderBy: { createdAt: 'desc' },
    });
};
