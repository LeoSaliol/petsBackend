import 'dotenv/config';
import app from './app';
import http from 'http';
import { Server } from 'socket.io';
import { applySocketAuthMiddleware } from './middlewares/socket.middleware';
import { handleChatEvents } from './sockets/chatHandler';
import { addOnlinePet, removeOnlinePet } from './sockets/onlineUser';
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
    const petId = socket.handshake.auth.petId;
    const userId = socket.handshake.auth.userId;
    socket.data.userId = userId;
    socket.data.petId = petId;

    if (petId) {
        addOnlinePet(petId, socket.id);
        socket.join(String(petId));
        io.emit('petOnline', { petId });
    }

    console.log('🟢 Pet conectado', petId);

    socket.on('getOnlinePets', () => {
        const { getOnlinePetIds } = require('./sockets/onlineUser');
        socket.emit('onlinePets', { petIds: getOnlinePetIds() });
    });

    handleChatEvents(socket, io);

    socket.on('disconnect', async () => {
        if (petId) {
            removeOnlinePet(petId);
            await prisma.user.update({
                where: { id: userId },
                data: { lastSeen: new Date() },
            });
            io.emit('petOffline', { petId });
            console.log('🔴 Pet desconectado', petId);
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
