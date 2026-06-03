"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../config/prisma");
jest.mock('../config/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findFirst: jest.fn(),
        },
        pet: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        post: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        like: {
            findUnique: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        },
        comment: {
            findMany: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        },
        follow: {
            findUnique: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        },
        notification: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        conversation: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        message: {
            findMany: jest.fn(),
            create: jest.fn(),
        },
    },
}));
global.prisma = prisma_1.prisma;
