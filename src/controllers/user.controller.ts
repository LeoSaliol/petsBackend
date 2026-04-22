import { NextFunction, Request, Response } from 'express';
import { getProfile, updateProfileService } from '../services/user.services';

export const profile = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const profileUserId = Number(req.params.userId);
        const { userId } = req.query;

        const result = await getProfile(profileUserId, Number(userId));

        res.json(result);
    } catch (error: any) {
        next(error);
    }
};

export const updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const profileUserId = Number(req.params.userId);

        const { name, bio } = req.body;
        const image = req.file?.path;
        const updateData = { name, bio, image };

        const result = await updateProfileService(profileUserId, updateData);

        res.json(result);
    } catch (error: any) {
        next(error);
    }
};
