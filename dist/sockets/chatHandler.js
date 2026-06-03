"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChatEvents = handleChatEvents;
const prisma_1 = require("../config/prisma");
function handleChatEvents(socket, io) {
    const userId = socket.data.userId;
    socket.on('joinConversations', async () => {
        try {
            const participations = await prisma_1.prisma.conversationParticipant.findMany({
                where: { userId },
                select: { conversationId: true },
            });
            participations.forEach(({ conversationId }) => {
                socket.join(`conv_${conversationId}`); // 👈 consistente
            });
        }
        catch (error) {
            socket.emit('error', {
                message: 'Error al unirse a las conversaciones',
            });
        }
    });
    socket.on('startConversation', async ({ targetUserId }) => {
        try {
            const existingConversation = await prisma_1.prisma.conversation.findFirst({
                where: {
                    AND: [
                        { participants: { some: { userId } } },
                        {
                            participants: {
                                some: { userId: targetUserId },
                            },
                        },
                    ],
                },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                    messages: {
                        orderBy: { createdAt: 'asc' },
                        take: 30,
                    },
                },
            });
            if (existingConversation) {
                socket.join(`conv_${existingConversation.id}`);
                // ✅ nombre correcto + emitir por room
                io.to(String(userId)).emit('conversationReady', existingConversation);
                return;
            }
            const conversation = await prisma_1.prisma.conversation.create({
                data: {
                    participants: {
                        create: [{ userId }, { userId: targetUserId }],
                    },
                },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                    messages: true,
                },
            });
            socket.join(`conv_${conversation.id}`);
            io.to(String(targetUserId)).socketsJoin(`conv_${conversation.id}`);
            io.to(String(userId)).emit('conversationReady', conversation);
            io.to(String(targetUserId)).emit('newConversation', conversation);
        }
        catch (error) {
            socket.emit('error', {
                message: 'Error al iniciar la conversación',
            });
            console.log('🔴 Error:', error);
        }
    });
    socket.on('sendMessage', async ({ conversationId, content, }) => {
        try {
            const participant = await prisma_1.prisma.conversationParticipant.findUnique({
                where: {
                    userId_conversationId: { userId, conversationId },
                },
            });
            if (!participant) {
                socket.emit('error', {
                    message: 'No pertenecés a esta conversación',
                });
                return;
            }
            const message = await prisma_1.prisma.message.create({
                data: { content, senderId: userId, conversationId },
                include: {
                    sender: {
                        select: { id: true, name: true, avatar: true },
                    },
                },
            });
            await prisma_1.prisma.conversation.update({
                where: { id: conversationId },
                data: { updatedAt: new Date() },
            });
            io.to(`conv_${conversationId}`).emit('newMessage', message); // 👈 consistente
        }
        catch (error) {
            socket.emit('error', { message: 'Error al enviar el mensaje' });
        }
    });
    socket.on('markAsRead', async ({ conversationId }) => {
        try {
            await prisma_1.prisma.message.updateMany({
                where: {
                    conversationId,
                    senderId: { not: userId },
                    isRead: false,
                },
                data: { isRead: true },
            });
            socket.to(`conv_${conversationId}`).emit('messagesRead', {
                conversationId,
                readBy: userId,
            });
        }
        catch (error) {
            socket.emit('error', { message: 'Error al marcar como leído' });
        }
    });
    socket.on('getMessages', async ({ conversationId, page = 1, }) => {
        try {
            const PAGE_SIZE = 30;
            const messages = await prisma_1.prisma.message.findMany({
                where: { conversationId },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * PAGE_SIZE,
                take: PAGE_SIZE,
                include: {
                    sender: {
                        select: { id: true, name: true, avatar: true },
                    },
                },
            });
            socket.emit('messageHistory', {
                conversationId,
                messages,
                page,
            });
        }
        catch (error) {
            socket.emit('error', { message: 'Error al obtener mensajes' });
        }
    });
}
