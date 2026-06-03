import { Request, Response, NextFunction } from 'express';
import { verifyToken, generateAccessToken } from '../utils/jwt';
import { prisma } from '../config/prisma';

interface JwtPayload {
    userId: number;
}

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;
    const petId = req.cookies.petId;

    if (!accessToken && !refreshToken) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        if (accessToken) {
            const decoded = verifyToken(accessToken) as JwtPayload;
            req.user = { id: decoded.userId };
            if (petId) {
                req.petId = Number(petId);
            }
            await prisma.user.update({
                where: { id: decoded.userId },
                data: { lastSeen: new Date() },
            }).catch(() => {});
            return next();
        }

        if (refreshToken) {
            const user = await prisma.user.findFirst({
                where: { refreshToken },
            });

            if (!user) {
                return res.status(401).json({ message: 'Invalid refresh token' });
            }

            const newAccessToken = generateAccessToken(user.id);
            
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
            await prisma.user.update({
                where: { id: user.id },
                data: { lastSeen: new Date() },
            }).catch(() => {});
            return next();
        }

        return res.status(401).json({ message: 'No token provided' });
    } catch {
        if (refreshToken) {
            try {
                const user = await prisma.user.findFirst({
                    where: { refreshToken },
                });

                if (user) {
                    const newAccessToken = generateAccessToken(user.id);
                    
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
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { lastSeen: new Date() },
                    }).catch(() => {});
                    return next();
                }
            } catch {
                return res.status(401).json({ message: 'Invalid token' });
            }
        }
        return res.status(401).json({ message: 'Invalid token' });
    }
};