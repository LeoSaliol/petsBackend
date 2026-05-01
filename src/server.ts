import app from './app';
import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import { applySocketAuthMiddleware } from './middlewares/socket.middleware';
import { handleChatEvents } from './sockets/chatHandler';
import { removeOnlineUser } from './sockets/onlineUser';
import { prisma } from './config/prisma';

const PORT = process.env.PORT || 2000;

const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
    },
});

applySocketAuthMiddleware(io);

io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log('🟢 Usuario conectado', userId);
    socket.join(String(userId));
    io.emit('userOnline', { userId });
    socket.on('getOnlineUsers', () => {
        const { getOnlineUserIds } = require('./sockets/onlineUser');
        socket.emit('onlineUsers', { userIds: getOnlineUserIds() });
    });

    handleChatEvents(socket, io);
    socket.on('disconnect', async () => {
        removeOnlineUser(userId);

        await prisma.user.update({
            where: { id: userId },
            data: { lastSeen: new Date() },
        });
        io.emit('userOffline', { userId });
        console.log('🔴 Usuario desconectado', userId);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
