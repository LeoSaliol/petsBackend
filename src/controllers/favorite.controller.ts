import { NextFunction, Request, Response } from 'express';
import { toggleFavorite, getFavorites } from '../services/favorite.services';
import { prisma } from '../config/prisma';

const resolvePetId = async (req: Request): Promise<number | null> => {
  if (req.petId) return req.petId;
  if (req.body?.petId) return Number(req.body.petId);
  if (req.query?.petId) return Number(req.query.petId);
  if (req.user) {
    const pet = await prisma.pet.findFirst({
      where: { ownerId: req.user.id },
      orderBy: { createdAt: 'asc' },
    });
    if (pet) return pet.id;
  }
  return null;
};

export const toggle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = Number(req.params.postId);
    const petId = await resolvePetId(req);

    if (!petId) {
      return res.status(400).json({ message: 'petId is required' });
    }

    const result = await toggleFavorite(petId, postId);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const petId = await resolvePetId(req);

    if (!petId) {
      return res.status(400).json({ message: 'petId is required' });
    }

    const posts = await getFavorites(petId);
    res.json({ success: true, data: posts });
  } catch (error: any) {
    next(error);
  }
};
