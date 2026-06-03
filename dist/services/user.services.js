"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileService = exports.getProfile = void 0;
const prisma_1 = require("../config/prisma");
const httpError_1 = require("../utils/httpError");
const cloudinary_1 = __importStar(require("../config/cloudinary"));
const getProfile = async (profileUserId, currentUserId) => {
    const pet = await prisma_1.prisma.pet.findUnique({
        where: { id: profileUserId },
        select: {
            id: true,
            ownerId: true,
            name: true,
            image: true,
            bio: true,
            createdAt: true,
            posts: {
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    image: true,
                    content: true,
                    createdAt: true,
                    _count: {
                        select: { comments: true, likes: true },
                    },
                },
            },
            _count: {
                select: {
                    followers: true,
                    following: true,
                },
            },
        },
    });
    if (!pet) {
        throw new httpError_1.HttpError('Pet not found', 404);
    }
    let isFollowing = false;
    if (currentUserId) {
        const follow = await prisma_1.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: profileUserId,
                },
            },
        });
        isFollowing = !!follow;
    }
    return {
        id: pet.id,
        ownerId: pet.ownerId,
        name: pet.name,
        followersCount: pet._count.followers,
        followingCount: pet._count.following,
        isFollowing,
        image: pet.image,
        bio: pet.bio,
        createdAt: pet.createdAt,
        posts: pet.posts,
    };
};
exports.getProfile = getProfile;
const updateProfileService = async (profileUserId, updateData) => {
    const { image } = updateData;
    const pet = await prisma_1.prisma.pet.findUnique({
        where: { id: profileUserId },
    });
    if (!pet) {
        throw new httpError_1.HttpError('Pet not found', 404);
    }
    if (image && pet.image) {
        const publicId = (0, cloudinary_1.getPublicIdFromUrl)(pet.image);
        await cloudinary_1.default.uploader.destroy(publicId);
    }
    const updatedPet = await prisma_1.prisma.pet.update({
        where: { id: profileUserId },
        data: {
            ...updateData,
            image: image ? image : pet.image,
        },
    });
    return updatedPet;
    throw new httpError_1.HttpError('Pet not found', 404);
};
exports.updateProfileService = updateProfileService;
