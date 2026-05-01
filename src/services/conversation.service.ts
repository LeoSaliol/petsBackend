import { prisma } from '../config/prisma';

export const getUserConversations = async (userId: number) => {
    const conversations = await prisma.conversation.findMany({
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
            },
        },
        orderBy: {
            updatedAt: 'desc',
        },
    });
    const conversationsWithUnread = await Promise.all(
        conversations.map(async (conv) => {
            const unreadCount = await prisma.message.count({
                where: {
                    conversationId: conv.id,
                    senderId: { not: userId },
                    isRead: false,
                },
            });
            return { ...conv, unreadCount };
        }),
    );
    return conversationsWithUnread;
};

export const getConversationById = async (
    conversationId: number,
    userId: number,
    page = 1,
) => {
    const PAGE_SIZE = 30;
    const participant = await prisma.conversationParticipant.findUnique({
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
    const message = await prisma.message.findMany({
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
