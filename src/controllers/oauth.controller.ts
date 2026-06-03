import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

export const googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email'],
});

export const googleAuthCallback = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    passport.authenticate(
        'google',
        { failureRedirect: `${process.env.CLIENT_URL}/auth/callback?error=google_failed` },
        (err: any, data: any) => {
            if (err || !data) {
                const errorMsg = err?.message || 'unknown_error';
                return res.redirect(`${process.env.CLIENT_URL}/auth/callback?error=${errorMsg}`);
            }

            const { accessToken, refreshToken, petId } = data;

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 1000 * 60 * 15,
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 1000 * 60 * 60 * 24 * 7,
            });
            res.cookie('petId', petId?.toString() || '', {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 1000 * 60 * 60 * 24 * 7,
            });

            res.redirect(`${process.env.CLIENT_URL}/auth/callback?success=true`);
        }
    )(req, res, next);
};

export const facebookAuth = passport.authenticate('facebook', {
    scope: ['email'],
});

export const facebookAuthCallback = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    passport.authenticate(
        'facebook',
        { failureRedirect: '/auth/callback?error=facebook_failed' },
        (err: any, data: any) => {
            if (err || !data) {
                return res.redirect(`${process.env.CLIENT_URL}/auth/callback?error=facebook_failed`);
            }

            const { accessToken, refreshToken, petId } = data;

            res.redirect(
                `${process.env.CLIENT_URL}/auth/callback?success=true&accessToken=${accessToken}&refreshToken=${refreshToken}&petId=${petId || ''}`
            );
        }
    )(req, res, next);
};