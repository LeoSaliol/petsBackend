"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = exports.toggle = void 0;
const favorite_services_1 = require("../services/favorite.services");
const prisma_1 = require("../config/prisma");
const resolvePetId = async (req) => {
    if (req.petId)
        return req.petId;
    if (req.body?.petId)
        return Number(req.body.petId);
    if (req.query?.petId)
        return Number(req.query.petId);
    if (req.user) {
        const pet = await prisma_1.prisma.pet.findFirst({
            where: { ownerId: req.user.id },
            orderBy: { createdAt: 'asc' },
        });
        if (pet)
            return pet.id;
    }
    return null;
};
const toggle = async (req, res, next) => {
    try {
        const postId = Number(req.params.postId);
        const petId = await resolvePetId(req);
        if (!petId) {
            return res.status(400).json({ message: 'petId is required' });
        }
        const result = await (0, favorite_services_1.toggleFavorite)(petId, postId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.toggle = toggle;
const list = async (req, res, next) => {
    try {
        const petId = await resolvePetId(req);
        if (!petId) {
            return res.status(400).json({ message: 'petId is required' });
        }
        const posts = await (0, favorite_services_1.getFavorites)(petId);
        res.json({ success: true, data: posts });
    }
    catch (error) {
        next(error);
    }
};
exports.list = list;
