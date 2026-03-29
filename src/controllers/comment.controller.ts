import { NextFunction, Request, Response } from 'express';
import { createComment, getCommentsByPost } from '../services/comment.services';

export const create = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const postId = Number(req.params.postId);
        const { content, petId } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Content required' });
        }

        const comment = await createComment(petId, postId, content);

        res.status(201).json(comment);
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
        const comments = await getCommentsByPost(postId);
        res.json(comments);
    } catch (error) {
        next(error);
    }
};
