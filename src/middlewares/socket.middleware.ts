import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

export function applySocketAuthMiddleware(io: Server) {
    io.use((socket: Socket, next) => {
        const cookieHeader = socket.handshake.headers.cookie;
        const cookies = parse(cookieHeader || '');
        const token = cookies['token'];
        if (!token) {
            return next(new Error('Authentication error: Token is required'));
        }
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
                userId: number;
            };
            socket.data.userId = payload.userId;
            next();
        } catch (error) {
            return next(new Error('Authentication error: Invalid token'));
        }
    });
}
