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
exports.updatePost = exports.deletePost = exports.getPostsByPet = exports.getFeed = exports.createPost = exports.getPostById = void 0;
const cloudinary_1 = __importStar(require("../config/cloudinary"));
const prisma_1 = require("../config/prisma");
const httpError_1 = require("../utils/httpError");
const getPostById = async (postId) => {
    const post = await prisma_1.prisma.post.findUnique({
        where: { id: postId },
        include: {
            likes: {
                select: {
                    petId: true,
                },
            },
            pet: true,
            _count: { select: { likes: true, comments: true } },
        },
    });
    if (!post) {
        throw new httpError_1.HttpError('Post not found', 404);
    }
    return post;
};
exports.getPostById = getPostById;
const createPost = async (petId, ownerId, content, image, location) => {
    //-- verifica que la mascota sea del usuario
    const pet = await prisma_1.prisma.pet.findFirst({
        where: { id: petId, ownerId },
    });
    if (!pet) {
        throw new httpError_1.HttpError('Pet not found or not yours', 400);
    }
    return prisma_1.prisma.post.create({
        data: {
            content,
            image: image,
            petId,
            location,
        },
    });
};
exports.createPost = createPost;
const getFeed = async (cursor, petId) => {
    let petIds = [];
    if (petId) {
        const pet = await prisma_1.prisma.pet.findUnique({
            where: { id: petId },
            include: {
                following: {
                    select: { followingId: true },
                },
            },
        });
        if (pet) {
            const followingIds = pet.following.map((f) => f.followingId);
            petIds = [petId, ...followingIds];
        }
    }
    const posts = await prisma_1.prisma.post.findMany({
        take: 10,
        ...(cursor && {
            skip: 1,
            cursor: {
                id: Number(cursor),
            },
        }),
        ...(petIds.length > 0 && {
            where: {
                petId: {
                    in: petIds,
                },
            },
        }),
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            pet: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },
            _count: {
                select: {
                    likes: true,
                    comments: true,
                },
            },
            likes: {
                where: { petId: petId },
                select: { petId: true },
            },
            favorites: {
                where: { petId: petId },
                select: { petId: true },
            },
        },
    });
    return posts.map((post) => ({
        ...post,
        likedByUser: post.likes.some((like) => like.petId === petId),
        favoritedByUser: post.favorites.some((f) => f.petId === petId),
    }));
};
exports.getFeed = getFeed;
const getPostsByPet = async (petId, requestingPetId) => {
    const posts = await prisma_1.prisma.post.findMany({
        where: { petId },
        orderBy: { createdAt: 'desc' },
        include: {
            _count: { select: { likes: true, comments: true } },
            ...(requestingPetId && {
                likes: {
                    where: { petId: requestingPetId },
                    select: { petId: true },
                },
                favorites: {
                    where: { petId: requestingPetId },
                    select: { petId: true },
                },
            }),
        },
    });
    return posts.map((post) => ({
        ...post,
        likedByUser: requestingPetId ? post.likes?.some((l) => l.petId === requestingPetId) : false,
        favoritedByUser: requestingPetId ? post.favorites?.some((f) => f.petId === requestingPetId) : false,
    }));
};
exports.getPostsByPet = getPostsByPet;
const deletePost = async (postId) => {
    const post = await prisma_1.prisma.post.findUnique({
        where: { id: postId },
    });
    if (!post) {
        throw new httpError_1.HttpError('Post not found', 404);
    }
    const publicId = (0, cloudinary_1.getPublicIdFromUrl)(post.image);
    await cloudinary_1.default.uploader.destroy(publicId);
    await prisma_1.prisma.post.delete({
        where: { id: postId },
    });
    return { message: 'Post deleted' };
};
exports.deletePost = deletePost;
const updatePost = async (postId, content, image, location) => {
    const post = await prisma_1.prisma.post.findUnique({
        where: { id: postId },
    });
    if (!post) {
        throw new Error('Post not found');
    }
    if (image) {
        const publicId = (0, cloudinary_1.getPublicIdFromUrl)(post.image);
        await cloudinary_1.default.uploader.destroy(publicId);
    }
    const updatedPost = await prisma_1.prisma.post.update({
        where: { id: postId },
        data: {
            content,
            image: image ?? post.image,
            location: location ?? post.location,
        },
    });
    return updatedPost;
};
exports.updatePost = updatePost;
