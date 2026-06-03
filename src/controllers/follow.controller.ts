import { NextFunction, Request, Response } from 'express';
import {
    toggleFollow,
    getFollowers,
    getFollowing,
} from '../services/follow.service';

export const toggle = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const followerId = req.petId;
        if (!followerId) return res.status(400).json({ message: 'No pet selected' });

        const followingId = Number(req.params.petId);

        const result = await toggleFollow(
            followerId,
            followingId,
        );

        res.json(result);
    } catch (error: any) {
        next(error);
    }
};

export const followers = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const petId = Number(req.params.id);
        const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;

        const followers = await getFollowers(petId, cursor);

        res.json({
            success: true,
            data: followers,
        });
    } catch (error) {
        next(error);
    }
};

export const following = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const petId = Number(req.params.petId);

        const result = await getFollowing(petId);

        res.json(result);
    } catch (error: any) {
        next(error);
    }
};
