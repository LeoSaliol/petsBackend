import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import { authMiddleware } from './middlewares/auth.middleware';
import petRoutes from './routes/pet.routes';
import postRoutes from './routes/post.routes';
import likeRoutes from './routes/like.routes';
import commentRoutes from './routes/comment.routes';
import followRoutes from './routes/follow.routes';
import userRoutes from './routes/user.routes';
import notificationRoutes from './routes/notifications.routes';
import conversationRoutes from './routes/conversation.routes';
import favoriteRoutes from './routes/favorite.routes';
import { errorMidleware } from './middlewares/error.middleware';
import cookieParser from 'cookie-parser';
import { attachPet } from './middlewares/attachPet';
import {
    authLimiter,
    generalLimiter,
    createPostLimiter,
} from './middlewares/rateLimit.middleware';
import passport from './config/passport';
import { prisma } from './config/prisma';

const app = express();
app.set('trust proxy', 1);
app.use(passport.initialize());

app.use(
    cors({
        origin: (origin, callback) => {
            const allowed = [process.env.FRONTEND_URL].filter(Boolean);

            if (!origin || allowed.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    }),
);
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authLimiter, authRoutes);
app.use('/posts/all', (_req, _res, next) => next());
app.use(generalLimiter);

app.use('/auth', authRoutes);
app.use('/pets', petRoutes);
app.use('/posts', createPostLimiter, postRoutes);
app.get('/me', authMiddleware, attachPet, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { id: true, name: true, email: true },
    });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.json({
        message: 'Access granted',
        petId: req.petId,
        user,
    });
});
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.use('/likes', likeRoutes);
app.use('/comments', commentRoutes);

app.use('/follow', followRoutes);
app.use('/users', userRoutes);
app.use('/notifications', notificationRoutes);
app.use('/conversations', conversationRoutes);
app.use('/favorites', favoriteRoutes);
app.use(errorMidleware);
export default app;
