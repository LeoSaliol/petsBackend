import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

export function applySocketAuthMiddleware(io: Server) {
    io.use((socket: Socket, next) => {
        let userId = socket.handshake.auth.userId;
        let petId = socket.handshake.auth.petId;

        if (!userId) {
            const cookieHeader = socket.handshake.headers.cookie;
            const cookies = parse(cookieHeader || '');
            const token = cookies['accessToken'];
            if (!token) {
                return next(new Error('Authentication error: Token is required'));
            }
            try {
                const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
                    userId: number;
                };
                userId = payload.userId;
            } catch (error) {
                return next(new Error('Authentication error: Invalid token'));
            }
        }

        if (!petId) {
            const cookieHeader = socket.handshake.headers.cookie;
            const cookies = parse(cookieHeader || '');
            petId = cookies['petId'] ? Number(cookies['petId']) : undefined;
        }

        socket.handshake.auth.userId = userId;
        socket.handshake.auth.petId = petId;
        next();
    });
}
