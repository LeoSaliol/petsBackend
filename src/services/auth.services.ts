import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';
import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/httpError';

interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

interface LoginInput {
    email: string;
    password: string;
}

export const registerUser = async ({
    name,
    email,
    password,
}: RegisterInput) => {
    const exists = await prisma.user.findUnique({
        where: { email },
    });

    if (exists) {
        throw new HttpError('Email already in use', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });
    console.log('user', user);

    return user;
};

//* Login service

export const loginUser = async ({ email, password }: LoginInput) => {
    console.log('aca entra?');
    console.log({ email, password });
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new HttpError('Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        throw new HttpError('Invalid credentials', 401);
    }

    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' },
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
    };
};
