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
const userService = __importStar(require("../../services/user.services"));
const prisma_1 = require("../../config/prisma");
jest.mock('../../config/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
            findMany: jest.fn(),
        },
        pet: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
        follow: {
            findUnique: jest.fn(),
        },
    },
}));
describe('User Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('getProfile', () => {
        it('should return user profile with pets', async () => {
            const mockPet = {
                id: 1,
                ownerId: 1,
                name: 'Pet1',
                image: 'pet.jpg',
                bio: 'A cute pet',
                createdAt: new Date(),
                posts: [],
                _count: {
                    followers: 10,
                    following: 5,
                },
            };
            prisma_1.prisma.pet.findUnique.mockResolvedValue(mockPet);
            const result = await userService.getProfile(1);
            expect(result.name).toBe('Pet1');
            expect(result.followersCount).toBe(10);
            expect(result.followingCount).toBe(5);
        });
        it('should throw error if pet not found', async () => {
            prisma_1.prisma.pet.findUnique.mockResolvedValue(null);
            await expect(userService.getProfile(999)).rejects.toThrow('Pet not found');
        });
    });
    describe('updateProfileService', () => {
        it('should throw error if pet not found', async () => {
            prisma_1.prisma.pet.findUnique.mockResolvedValue(null);
            await expect(userService.updateProfileService(999, { name: 'New Name' })).rejects.toThrow('Pet not found');
        });
    });
});
