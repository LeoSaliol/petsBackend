import { Request, Response } from 'express';
import {
    toggleFollow,
    getFollowers,
    getFollowing,
} from '../services/follow.service';

export const toggle = async (req: Request, res: Response) => {
    try {
        const followingId = Number(req.params.userId);

        const result = await toggleFollow(
            req.userId!, //* usuario logueado
            followingId, //* usuario a seguir
        );

        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const followers = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params.userId);

        const result = await getFollowers(userId);

        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const following = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params.userId);

        const result = await getFollowing(userId);

        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
