import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    userId: number;
}

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const token = req.cookies.token;
    const petId = req.cookies.petId;
    if (!petId) {
        return res.status(400).json({ message: 'No petId provided' });
    }

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string,
        ) as JwtPayload;

        req.user = { id: decoded.userId };
        req.petId = Number(petId);
        next();
    } catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
