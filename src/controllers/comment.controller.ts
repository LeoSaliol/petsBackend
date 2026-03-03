import { Request, Response } from 'express';
import { createComment, getCommentsByPost } from '../services/comment.services';

export const create = async (req: Request, res: Response) => {
    try {
        const postId = Number(req.params.postId);
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Content required' });
        }

        const comment = await createComment(req.userId!, postId, content);

        res.status(201).json(comment);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const byPost = async (req: Request, res: Response) => {
    const postId = Number(req.params.postId);
    const comments = await getCommentsByPost(postId);
    res.json(comments);
};
