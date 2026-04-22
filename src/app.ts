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
import { errorMidleware } from './middlewares/error.middleware';
import cookieParser from 'cookie-parser';
import { attachPet } from './middlewares/attachPet';
const app = express();

// app.use(cors());
app.use(
    cors({
        origin: 'http://localhost:5173', // 👈 tu frontend
        credentials: true,
    }),
);
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRoutes);

app.use('/pets', petRoutes);
app.use('/posts', postRoutes);
app.get('/me', authMiddleware, attachPet, (req, res) => {
    res.json({
        message: 'Access granted',
        petId: req.petId,
        user: {
            id: req.user!.id,
        },
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
app.use(errorMidleware);
export default app;
