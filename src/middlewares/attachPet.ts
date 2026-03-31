import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const attachPet = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        if (!req.user) {
            return next();
        }
        const userId = req.user.id;

        const pet = await prisma.pet.findFirst({
            where: { ownerId: userId },
        });
        if (!pet) {
            return next();
        }
        req.petId = pet.id;

        next();
    } catch (error) {
        next(error);
    }
};
