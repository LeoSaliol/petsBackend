import { NextFunction, Request, Response } from 'express';
import * as authService from '../services/auth.services';

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

//* Login controller

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const data = await authService.loginUser(req.body);

        res.cookie('token', data.token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 27,
        });
        res.cookie('petId', data.petId, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 27,
        });

        res.json({
            success: true,
            data,
            message: 'Login successful',
        });
    } catch (error: any) {
        next(error);
    }
};
