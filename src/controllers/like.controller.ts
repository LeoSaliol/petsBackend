import { NextFunction, Request, Response } from 'express';
import { getLikesByPost, toggleLike } from '../services/like.services';

export const toggle = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const postId = Number(req.params.postId);

        const result = await toggleLike(req.petId!, postId);

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
