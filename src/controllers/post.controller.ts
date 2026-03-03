import { Request, Response } from 'express';
import { createPost, getFeed, getPostsByPet } from '../services/post.services';

export const create = async (req: Request, res: Response) => {
    try {
        const { petId, content, image } = req.body;

        if (!petId || !image) {
            return res
                .status(400)
                .json({ message: 'petId and image are required' });
        }

        const post = await createPost(petId, req.userId!, content, image);

        res.status(201).json(post);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const feed = async (_: Request, res: Response) => {
    const posts = await getFeed();
    res.json(posts);
};

export const postsByPet = async (req: Request, res: Response) => {
    const petId = Number(req.params.petId);
    const posts = await getPostsByPet(petId);
    res.json(posts);
};
