import bcrypt from 'bcrypt';
import * as authService from '../../services/auth.services';
import { prisma } from '../../config/prisma';
import { HttpError } from '../../utils/httpError';

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
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: 1,
                email: 'test@test.com',
            });

            await expect(
                authService.registerUser({
                    name: 'Test',
                    email: 'test@test.com',
                    password: 'password123',
                }),
            ).rejects.toThrow('Email already in use');
        });

        it('should create user successfully', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
            (prisma.user.create as jest.Mock).mockResolvedValue({
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
            expect(prisma.user.create).toHaveBeenCalledWith({
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
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                authService.loginUser({
                    email: 'notfound@test.com',
                    password: 'password',
                }),
            ).rejects.toThrow('Invalid credentials');
        });

        it('should throw error if password is invalid', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: 1,
                email: 'test@test.com',
                password: 'hashed-password',
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(
                authService.loginUser({
                    email: 'test@test.com',
                    password: 'wrong-password',
                }),
            ).rejects.toThrow('Invalid credentials');
        });

        it('should return tokens and user data on successful login', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: 1,
                name: 'Test',
                email: 'test@test.com',
                password: 'hashed-password',
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (prisma.pet.findMany as jest.Mock).mockResolvedValue([
                { id: 1, name: 'Pet1' },
            ]);
            (prisma.user.update as jest.Mock).mockResolvedValue({});

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