import { Request, Response } from 'express';
import { getLikesByPost, toggleLike } from '../services/like.services';

export const toggle = async (req: Request, res: Response) => {
    try {
        const postId = Number(req.params.postId);

        const result = await toggleLike(req.userId!, postId);

        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
export const byPost = async (req: Request, res: Response) => {
    const postId = Number(req.params.postId);
    const likes = await getLikesByPost(postId);
    res.json(likes);
};
