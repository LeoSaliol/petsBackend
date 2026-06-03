"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadMessagesCount = exports.markConversationAsRead = exports.sendMessage = exports.deleteConversation = exports.getConversationById = exports.getUserConversations = exports.createOrGetConversation = void 0;
const prisma_1 = require("../config/prisma");
const createOrGetConversation = async (userId, petId) => {
    const pet = await prisma_1.prisma.pet.findUnique({ where: { id: petId } });
    if (!pet)
        throw new Error('Pet not found');
    const existingConversation = await prisma_1.prisma.conversation.findFirst({
        where: {
            participants: {
                some: { userId },
            },
            AND: {
                participants: {
                    some: { userId: pet.ownerId },
                },
            },
        },
    });
    if (existingConversation) {
        return existingConversation;
    }
    const conversation = await prisma_1.prisma.conversation.create({
        data: {
            participants: {
                create: [{ userId }, { userId: pet.ownerId }],
            },
        },
    });
    return conversation;
};
exports.createOrGetConversation = createOrGetConversation;
const getUserConversations = async (userId) => {
    const conversations = await prisma_1.prisma.conversation.findMany({
        where: {
            participants: {
                some: { userId },
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
                            lastSeen: true,
                            pets: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true,
                                },
                            },
                        },
                    },
                },
            },
            messages: {
                orderBy: {
                    createdAt: 'desc',
                },
                take: 1,
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            updatedAt: 'desc',
        },
    });
    const conversationsWithUnread = await Promise.all(conversations.map(async (conv) => {
        const unreadCount = await prisma_1.prisma.message.count({
            where: {
                conversationId: conv.id,
                senderId: { not: userId },
                isRead: false,
            },
        });
        return { ...conv, unreadCount };
    }));
    return conversationsWithUnread;
};
exports.getUserConversations = getUserConversations;
const getConversationById = async (conversationId, userId, page = 1) => {
    const PAGE_SIZE = 30;
    const participant = await prisma_1.prisma.conversationParticipant.findUnique({
        where: {
            userId_conversationId: {
                userId,
                conversationId,
            },
        },
    });
    if (!participant) {
        throw new Error('No tenés acceso a esta conversación');
    }
    const message = await prisma_1.prisma.message.findMany({
        where: {
            conversationId,
        },
        take: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                },
            },
        },
    });
    return message.reverse();
};
exports.getConversationById = getConversationById;
const deleteConversation = async (conversationId, userId) => {
    const participant = await prisma_1.prisma.conversationParticipant.findUnique({
        where: {
            userId_conversationId: {
                userId,
                conversationId,
            },
        },
    });
    if (!participant) {
        throw new Error('No tenés acceso a esta conversación');
    }
    await prisma_1.prisma.message.deleteMany({
        where: { conversationId },
    });
    await prisma_1.prisma.conversationParticipant.deleteMany({
        where: { conversationId },
    });
    await prisma_1.prisma.conversation.delete({
        where: { id: conversationId },
    });
};
exports.deleteConversation = deleteConversation;
const sendMessage = async (conversationId, senderId, content) => {
    const message = await prisma_1.prisma.message.create({
        data: {
            content,
            conversationId,
            senderId,
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                },
            },
        },
    });
    await prisma_1.prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
    });
    return message;
};
exports.sendMessage = sendMessage;
const markConversationAsRead = async (conversationId, userId) => {
    await prisma_1.prisma.message.updateMany({
        where: {
            conversationId,
            senderId: { not: userId },
            isRead: false,
        },
        data: { isRead: true },
    });
};
exports.markConversationAsRead = markConversationAsRead;
const getUnreadMessagesCount = async (userId) => {
    const count = await prisma_1.prisma.message.count({
        where: {
            conversation: {
                participants: {
                    some: { userId },
                },
            },
            senderId: { not: userId },
            isRead: false,
        },
    });
    return count;
};
exports.getUnreadMessagesCount = getUnreadMessagesCount;
