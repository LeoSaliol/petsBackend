"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.logoutUser = exports.refreshAccessToken = exports.loginUser = exports.registerUser = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../config/prisma");
const mail_1 = require("../config/mail");
const jwt_1 = require("../utils/jwt");
const httpError_1 = require("../utils/httpError");
const registerUser = async ({ name, email, password, }) => {
    const exists = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (exists) {
        throw new httpError_1.HttpError('Email already in use', 400);
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const user = await prisma_1.prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });
    return user;
};
exports.registerUser = registerUser;
const loginUser = async ({ email, password }) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new httpError_1.HttpError('Invalid credentials', 401);
    }
    if (user.password.startsWith('oauth-')) {
        throw new httpError_1.HttpError('Esta cuenta fue creada con Google. Iniciá sesión con Google.', 401);
    }
    const isValidPassword = await bcrypt_1.default.compare(password, user.password);
    if (!isValidPassword) {
        throw new httpError_1.HttpError('Invalid credentials', 401);
    }
    const pets = await prisma_1.prisma.pet.findMany({
        where: { ownerId: user.id },
    });
    const accessToken = (0, jwt_1.generateAccessToken)(user.id);
    const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
    await prisma_1.prisma.user.update({
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
exports.loginUser = loginUser;
const refreshAccessToken = async (refreshToken) => {
    try {
        const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
        });
        if (!user || user.refreshToken !== refreshToken) {
            throw new httpError_1.HttpError('Invalid refresh token', 401);
        }
        const newAccessToken = (0, jwt_1.generateAccessToken)(user.id);
        const newRefreshToken = (0, jwt_1.generateRefreshToken)(user.id);
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken },
        });
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }
    catch (error) {
        throw new httpError_1.HttpError('Invalid or expired refresh token', 401);
    }
};
exports.refreshAccessToken = refreshAccessToken;
const logoutUser = async (userId) => {
    await prisma_1.prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
    });
};
exports.logoutUser = logoutUser;
const forgotPassword = async (email) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user)
        return;
    if (user.password.startsWith('oauth-'))
        return;
    const token = crypto_1.default.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);
    await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: { resetToken: token, resetTokenExpiry: expiry },
    });
    await (0, mail_1.sendPasswordResetEmail)(email, token);
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (token, newPassword) => {
    const user = await prisma_1.prisma.user.findFirst({
        where: {
            resetToken: token,
            resetTokenExpiry: { gte: new Date() },
        },
    });
    if (!user) {
        throw new httpError_1.HttpError('Token inválido o expirado', 400);
    }
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
    await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
            refreshToken: null,
        },
    });
};
exports.resetPassword = resetPassword;
