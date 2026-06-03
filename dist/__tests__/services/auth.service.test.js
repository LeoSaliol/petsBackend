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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const authService = __importStar(require("../../services/auth.services"));
const prisma_1 = require("../../config/prisma");
jest.mock('../../config/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findFirst: jest.fn(),
        },
        pet: {
            findMany: jest.fn(),
        },
    },
}));
jest.mock('bcrypt', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));
jest.mock('../../utils/jwt', () => ({
    generateAccessToken: jest.fn(() => 'mock-access-token'),
    generateRefreshToken: jest.fn(() => 'mock-refresh-token'),
    verifyRefreshToken: jest.fn(),
}));
describe('Auth Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('registerUser', () => {
        it('should throw error if email already exists', async () => {
            prisma_1.prisma.user.findUnique.mockResolvedValue({
                id: 1,
                email: 'test@test.com',
            });
            await expect(authService.registerUser({
                name: 'Test',
                email: 'test@test.com',
                password: 'password123',
            })).rejects.toThrow('Email already in use');
        });
        it('should create user successfully', async () => {
            prisma_1.prisma.user.findUnique.mockResolvedValue(null);
            bcrypt_1.default.hash.mockResolvedValue('hashed-password');
            prisma_1.prisma.user.create.mockResolvedValue({
                id: 1,
                name: 'Test',
                email: 'test@test.com',
                password: 'hashed-password',
            });
            const result = await authService.registerUser({
                name: 'Test',
                email: 'test@test.com',
                password: 'password123',
            });
            expect(result).toEqual({
                id: 1,
                name: 'Test',
                email: 'test@test.com',
                password: 'hashed-password',
            });
            expect(prisma_1.prisma.user.create).toHaveBeenCalledWith({
                data: {
                    name: 'Test',
                    email: 'test@test.com',
                    password: 'hashed-password',
                },
            });
        });
    });
    describe('loginUser', () => {
        it('should throw error if user not found', async () => {
            prisma_1.prisma.user.findUnique.mockResolvedValue(null);
            await expect(authService.loginUser({
                email: 'notfound@test.com',
                password: 'password',
            })).rejects.toThrow('Invalid credentials');
        });
        it('should throw error if password is invalid', async () => {
            prisma_1.prisma.user.findUnique.mockResolvedValue({
                id: 1,
                email: 'test@test.com',
                password: 'hashed-password',
            });
            bcrypt_1.default.compare.mockResolvedValue(false);
            await expect(authService.loginUser({
                email: 'test@test.com',
                password: 'wrong-password',
            })).rejects.toThrow('Invalid credentials');
        });
        it('should return tokens and user data on successful login', async () => {
            prisma_1.prisma.user.findUnique.mockResolvedValue({
                id: 1,
                name: 'Test',
                email: 'test@test.com',
                password: 'hashed-password',
            });
            bcrypt_1.default.compare.mockResolvedValue(true);
            prisma_1.prisma.pet.findMany.mockResolvedValue([
                { id: 1, name: 'Pet1' },
            ]);
            prisma_1.prisma.user.update.mockResolvedValue({});
            const result = await authService.loginUser({
                email: 'test@test.com',
                password: 'password123',
            });
            expect(result.accessToken).toBe('mock-access-token');
            expect(result.refreshToken).toBe('mock-refresh-token');
            expect(result.user).toEqual({
                id: 1,
                name: 'Test',
                email: 'test@test.com',
            });
            expect(result.petId).toBe(1);
        });
    });
});
