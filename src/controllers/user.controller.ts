import { NextFunction, Request, Response } from 'express';
import { getProfile } from '../services/user.services';

export const profile = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const profileUserId = Number(req.params.userId);

        const result = await getProfile(profileUserId, req.userId!);

        res.json(result);
    } catch (error: any) {
        next(error);
    }
};
