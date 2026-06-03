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
const postService = __importStar(require("../../services/post.services"));
const prisma_1 = require("../../config/prisma");
jest.mock('../../config/prisma', () => ({
    prisma: {
        post: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
        },
        pet: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
        },
        like: {
            findUnique: jest.fn(),
            delete: jest.fn(),
            create: jest.fn(),
        },
        notification: {
            create: jest.fn(),
        },
    },
}));
describe('Post Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('createPost', () => {
        it('should create post successfully', async () => {
            const mockPet = { id: 1, ownerId: 1 };
            const mockPost = {
                id: 1,
                image: 'image.jpg',
                content: 'Test description',
                petId: 1,
            };
            prisma_1.prisma.pet.findFirst.mockResolvedValue(mockPet);
            prisma_1.prisma.post.create.mockResolvedValue(mockPost);
            const result = await postService.createPost(1, 1, 'Test description', 'image.jpg');
            expect(result).toEqual(mockPost);
        });
        it('should throw error if pet not found', async () => {
            prisma_1.prisma.pet.findFirst.mockResolvedValue(null);
            await expect(postService.createPost(999, 1, 'Test', 'image.jpg')).rejects.toThrow('Pet not found or not yours');
        });
    });
    describe('getPostsByPet', () => {
        it('should return posts for a pet', async () => {
            const mockPosts = [
                { id: 1, image: 'img1.jpg', petId: 1 },
                { id: 2, image: 'img2.jpg', petId: 1 },
            ];
            prisma_1.prisma.post.findMany.mockResolvedValue(mockPosts);
            const result = await postService.getPostsByPet(1);
            expect(result).toEqual(mockPosts);
        });
    });
    describe('getFeed', () => {
        it('should return posts feed', async () => {
            const mockPosts = [
                { id: 1, image: 'img1.jpg', likes: [], pet: { id: 1, name: 'Pet1' }, _count: { likes: 0, comments: 0 } },
            ];
            prisma_1.prisma.post.findMany.mockResolvedValue(mockPosts);
            const result = await postService.getFeed(undefined, 1);
            expect(result).toHaveLength(1);
        });
    });
});
