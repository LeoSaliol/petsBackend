import { NextFunction, Request, Response } from 'express';
import {
    createPet,
    getMyPets,
    updatePet,
    deletePet,
} from '../services/pet.services';

export const create = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { name, bio, image } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const pet = await createPet({
            name,
            bio,
            image,
            ownerId: req.userId!,
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
        const pets = await getMyPets(req.userId!);
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
        const pet = await updatePet(petId, req.userId!, req.body);
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
        await deletePet(petId, req.userId!);
        res.status(204).send();
    } catch (error: any) {
        next(error);
    }
};
