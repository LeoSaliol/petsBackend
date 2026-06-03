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

        if (req.petId) {
            const pet = await prisma.pet.findFirst({
                where: { id: req.petId, ownerId: userId },
            });
            if (pet) return next();
        }

        const pet = await prisma.pet.findFirst({
            where: { ownerId: userId },
            orderBy: { id: 'asc' },
        });
        if (pet) {
            req.petId = pet.id;
        }

        next();
    } catch (error) {
        next(error);
    }
};
