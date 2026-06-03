"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const prisma_1 = require("../config/prisma");
const authMiddleware = async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;
    const petId = req.cookies.petId;
    if (!accessToken && !refreshToken) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        if (accessToken) {
            const decoded = (0, jwt_1.verifyToken)(accessToken);
            req.user = { id: decoded.userId };
            if (petId) {
                req.petId = Number(petId);
            }
            await prisma_1.prisma.user.update({
                where: { id: decoded.userId },
                data: { lastSeen: new Date() },
            }).catch(() => { });
            return next();
        }
        if (refreshToken) {
            const user = await prisma_1.prisma.user.findFirst({
                where: { refreshToken },
            });
            if (!user) {
                return res.status(401).json({ message: 'Invalid refresh token' });
            }
            const newAccessToken = (0, jwt_1.generateAccessToken)(user.id);
            res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 1000 * 60 * 15,
            });
            req.user = { id: user.id };
            if (petId) {
                req.petId = Number(petId);
            }
            await prisma_1.prisma.user.update({
                where: { id: user.id },
                data: { lastSeen: new Date() },
            }).catch(() => { });
            return next();
        }
        return res.status(401).json({ message: 'No token provided' });
    }
    catch {
        if (refreshToken) {
            try {
                const user = await prisma_1.prisma.user.findFirst({
                    where: { refreshToken },
                });
                if (user) {
                    const newAccessToken = (0, jwt_1.generateAccessToken)(user.id);
                    res.cookie('accessToken', newAccessToken, {
                        httpOnly: true,
                        secure: false,
                        sameSite: 'lax',
                        maxAge: 1000 * 60 * 15,
                    });
                    req.user = { id: user.id };
                    if (petId) {
                        req.petId = Number(petId);
                    }
                    await prisma_1.prisma.user.update({
                        where: { id: user.id },
                        data: { lastSeen: new Date() },
                    }).catch(() => { });
                    return next();
                }
            }
            catch {
                return res.status(401).json({ message: 'Invalid token' });
            }
        }
        return res.status(401).json({ message: 'Invalid token' });
    }
};
exports.authMiddleware = authMiddleware;
