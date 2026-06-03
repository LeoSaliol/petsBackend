export const prismaMock = {
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
    $connect: jest.fn(),
    $disconnect: jest.fn(),
};