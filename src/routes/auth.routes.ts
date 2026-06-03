import { Router } from 'express';
import { login, register, refreshToken, forgotPassword, resetPassword, logout } from '../controllers/auth.controller';
import { googleAuth, googleAuthCallback } from '../controllers/oauth.controller';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema, registerSchema } from '../validations/auth.validation';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback);

export default router;