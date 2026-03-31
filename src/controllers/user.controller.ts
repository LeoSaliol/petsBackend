import { NextFunction, Request, Response } from 'express';
import { getProfile } from '../services/user.services';

export const profile = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const profileUserId = Number(req.params.userId);
        const petId = req.petId;
        const result = await getProfile(profileUserId, petId!);

        res.json(result);
    } catch (error: any) {
        next(error);
    }
};
