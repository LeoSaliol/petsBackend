import { NextFunction, Request, Response } from 'express';
import {
    createPost,
    deletePost,
    getFeed,
    getPostsByPet,
    updatePost,
} from '../services/post.services';

export const create = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { petId, content } = req.body;

        const image = (req.file as any)?.path;

        if (!petId || !image) {
            return res
                .status(400)
                .json({ message: 'petId and image are required' });
        }

        const post = await createPost(
            Number(petId),
            req.user!.id,
            content,
            image,
        );

        res.status(201).json(post);
    } catch (error: any) {
        next(error);
    }
};

export const feed = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cursor, petId } = req.query;

        const posts = await getFeed(
            cursor ? String(cursor) : undefined,
            petId ? Number(petId) : undefined,
        );

        res.json(posts);
    } catch (error: any) {
        next(error);
    }
};

export const postsByPet = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const petId = Number(req.params.petId);
        const posts = await getPostsByPet(petId);
        res.json(posts);
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
        const postId = Number(req.params.postId);
        const result = await deletePost(postId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const update = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const postId = Number(req.params.id);
        const { content } = req.body;

        const image = (req.file as any)?.path;

        const post = await updatePost(postId, content, image);

        res.json(post);
    } catch (error) {
        next(error);
    }
};
