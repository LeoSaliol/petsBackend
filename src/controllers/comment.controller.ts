import { NextFunction, Request, Response } from 'express';
import { createComment, updateComment, deleteComment, getCommentsByPost } from '../services/comment.services';

export const create = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const postId = Number(req.params.postId);
        const { content } = req.body;
        const petId = req.petId;
        if (!petId) return res.status(400).json({ message: 'No pet selected' });

        if (!content) {
            return res.status(400).json({ message: 'Content required' });
        }

        const comment = await createComment(petId, postId, content);

        res.status(201).json(comment);
    } catch (error: any) {
        next(error);
    }
};

export const update = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const commentId = Number(req.params.commentId);
        const { content } = req.body;
        const petId = req.petId;
        if (!petId) return res.status(400).json({ message: 'No pet selected' });
        if (!content) return res.status(400).json({ message: 'Content required' });

        const comment = await updateComment(commentId, petId, content);
        res.json(comment);
    } catch (error: any) {
        next(error);
    }
};

export const remove = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const commentId = Number(req.params.commentId);
        const petId = req.petId;
        if (!petId) return res.status(400).json({ message: 'No pet selected' });

        await deleteComment(commentId, petId);
        res.json({ success: true });
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
