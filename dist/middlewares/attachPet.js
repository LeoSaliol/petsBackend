"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachPet = void 0;
const prisma_1 = require("../config/prisma");
const attachPet = async (req, res, next) => {
    try {
        if (!req.user) {
            return next();
        }
        const userId = req.user.id;
        const pet = await prisma_1.prisma.pet.findFirst({
            where: { ownerId: userId },
        });
        if (!pet) {
            return next();
        }
        req.petId = pet.id;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.attachPet = attachPet;
