import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';
import { sendPasswordResetEmail } from '../config/mail';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, JwtPayload } from '../utils/jwt';
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

    return user;
};

export const loginUser = async ({ email, password }: LoginInput) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new HttpError('Invalid credentials', 401);
    }

    if (user.password.startsWith('oauth-')) {
        throw new HttpError('Esta cuenta fue creada con Google. Iniciá sesión con Google.', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        throw new HttpError('Invalid credentials', 401);
    }

    const pets = await prisma.pet.findMany({
        where: { ownerId: user.id },
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken, lastSeen: new Date() },
    });

    return {
        accessToken,
        refreshToken,
        petId: pets[0]?.id,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
    };
};

export const refreshAccessToken = async (refreshToken: string) => {
    try {
        const decoded = verifyRefreshToken(refreshToken) as JwtPayload;

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user || user.refreshToken !== refreshToken) {
            throw new HttpError('Invalid refresh token', 401);
        }

        const newAccessToken = generateAccessToken(user.id);
        const newRefreshToken = generateRefreshToken(user.id);

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken },
        });

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    } catch (error) {
        throw new HttpError('Invalid or expired refresh token', 401);
    }
};

export const logoutUser = async (userId: number) => {
    await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
    });
};

export const forgotPassword = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return;

    if (user.password.startsWith('oauth-')) return;

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: token, resetTokenExpiry: expiry },
    });

    await sendPasswordResetEmail(email, token);
};

export const resetPassword = async (token: string, newPassword: string) => {
    const user = await prisma.user.findFirst({
        where: {
            resetToken: token,
            resetTokenExpiry: { gte: new Date() },
        },
    });

    if (!user) {
        throw new HttpError('Token inválido o expirado', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
            refreshToken: null,
        },
    });
};