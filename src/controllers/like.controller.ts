import { NextFunction, Request, Response } from 'express';
import { getLikesByPost, toggleLike } from '../services/like.services';

export const toggle = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const postId = Number(req.params.postId);

        const petId = req.petId;
        if (!petId) return res.status(400).json({ message: 'No pet selected' });
        const result = await toggleLike(petId, postId);

        res.json(result);
    } catch (error: any) {
        next(error);
    }
};
export const byPost = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const postId = Number(req.params.postId);
        const likes = await getLikesByPost(postId);
        res.json(likes);
    } catch (error: any) {
        next(error);
    }
};
