"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.facebookAuthCallback = exports.facebookAuth = exports.googleAuthCallback = exports.googleAuth = void 0;
const passport_1 = __importDefault(require("passport"));
exports.googleAuth = passport_1.default.authenticate('google', {
    scope: ['profile', 'email'],
});
const googleAuthCallback = (req, res, next) => {
    passport_1.default.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/auth/callback?error=google_failed` }, (err, data) => {
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
    })(req, res, next);
};
exports.googleAuthCallback = googleAuthCallback;
exports.facebookAuth = passport_1.default.authenticate('facebook', {
    scope: ['email'],
});
const facebookAuthCallback = (req, res, next) => {
    passport_1.default.authenticate('facebook', { failureRedirect: '/auth/callback?error=facebook_failed' }, (err, data) => {
        if (err || !data) {
            return res.redirect(`${process.env.CLIENT_URL}/auth/callback?error=facebook_failed`);
        }
        const { accessToken, refreshToken, petId } = data;
        res.redirect(`${process.env.CLIENT_URL}/auth/callback?success=true&accessToken=${accessToken}&refreshToken=${refreshToken}&petId=${petId || ''}`);
    })(req, res, next);
};
exports.facebookAuthCallback = facebookAuthCallback;
