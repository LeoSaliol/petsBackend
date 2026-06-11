import { NextFunction, Request, Response } from 'express';
import * as authService from '../services/auth.services';
const isProduction = process.env.NODE_ENV === 'production';
export const register = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json({
            success: true,
            data: user,
            message: 'User registered successfully',
        });
    } catch (error: any) {
        next(error);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const data = await authService.loginUser(req.body);

        res.cookie('accessToken', data.accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 1000 * 60 * 15,
        });
        res.cookie('refreshToken', data.refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        res.cookie('petId', data.petId, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        res.json({
            success: true,
            data: {
                user: data.user,
                petId: data.petId,
            },
            message: 'Login successful',
        });
    } catch (error: any) {
        next(error);
    }
};

export const refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'No refresh token provided',
            });
        }

        const tokens = await authService.refreshAccessToken(refreshToken);

        res.cookie('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 1000 * 60 * 15,
        });
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        res.json({
            success: true,
            message: 'Token refreshed successfully',
        });
    } catch (error: any) {
        next(error);
    }
};

export const forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res
                .status(400)
                .json({ success: false, message: 'Email requerido' });
        }
        await authService.forgotPassword(email);
        res.json({
            success: true,
            message: 'Si el email existe, recibirás un enlace de recuperación',
        });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: 'Token y contraseña requeridos',
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres',
            });
        }
        await authService.resetPassword(token, password);
        res.json({
            success: true,
            message: 'Contraseña restablecida correctamente',
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = (req as any).user?.id;

        if (userId) {
            await authService.logoutUser(userId);
        }
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
        } as const;
        res.clearCookie('accessToken', cookieOptions);
        res.clearCookie('refreshToken', cookieOptions);
        res.clearCookie('petId', cookieOptions);

        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error: any) {
        next(error);
    }
};
