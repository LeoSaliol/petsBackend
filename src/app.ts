import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import { authMiddleware } from './middlewares/auth.middleware';
import petRoutes from './routes/pet.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);

app.use('/pets', petRoutes);

app.get('/me', authMiddleware, (req, res) => {
    res.json({
        message: 'Access granted',
        userId: req.userId,
    });
});
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

export default app;
