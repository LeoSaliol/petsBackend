import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import {
    createPet,
    getMyPets,
    updatePet,
    deletePet,
    getPetById,
} from '../services/pet.services';

export const create = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { name, bio } = req.body;
        const image = (req.file as any)?.path;

        if (!name || !image) {
            return res
                .status(400)
                .json({ message: 'Name and image are required' });
        }

        const pet = await createPet({
            name,
            bio,
            image,
            ownerId: req.user!.id,
        });

        res.status(201).json(pet);
    } catch (error: any) {
        next(error);
    }
};

export const myPets = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const pets = await getMyPets(req.user!.id);
        res.json(pets);
    } catch (error: any) {
        next(error);
    }
};

export const update = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const petId = Number(req.params.id);
        const { name, bio } = req.body;
        const image = (req.file as any)?.path;

        if (!name || !image) {
            return res
                .status(400)
                .json({ message: 'Name and image are required' });
        }

        const pet = await updatePet(petId, req.user!.id, { name, bio, image });
        res.json(pet);
    } catch (error: any) {
        next(error);
    }
};

export const remove = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const petId = Number(req.params.id);
        await deletePet(petId, req.user!.id);
        res.json({ success: true, message: 'Mascota eliminada' });
    } catch (error: any) {
        next(error);
    }
};

export const selectPet = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const petId = Number(req.params.petId);
        const userId = req.user!.id;

        const pet = await prisma.pet.findFirst({
            where: { id: petId, ownerId: userId },
        });

        if (!pet) {
            return res.status(404).json({ message: 'Mascota no encontrada' });
        }

        res.cookie('petId', petId, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 30,
        });

        res.json({ success: true, petId });
    } catch (error: any) {
        next(error);
    }
};

export const getById = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const petId = Number(req.params.id);
        const currentPetId = req.petId;
        const pet = await getPetById(petId, currentPetId);
        res.json(pet);
    } catch (error: any) {
        next(error);
    }
};
