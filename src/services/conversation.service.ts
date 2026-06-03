import { prisma } from '../config/prisma';

export const createOrGetConversation = async (
    currentPetId: number,
    targetPetId: number,
) => {
    const targetPet = await prisma.pet.findUnique({ where: { id: targetPetId } });
    if (!targetPet) throw new Error('Pet not found');

    const existingConversation = await prisma.conversation.findFirst({
        where: {
            AND: [
                { participants: { some: { petId: currentPetId } } },
                { participants: { some: { petId: targetPetId } } },
            ],
        },
    });

    if (existingConversation) {
        return existingConversation;
    }

    const conversation = await prisma.conversation.create({
        data: {
            participants: {
                create: [{ petId: currentPetId }, { petId: targetPetId }],
            },
        },
    });

    return conversation;
};

export const getPetConversations = async (petId: number) => {
    const conversations = await prisma.conversation.findMany({
        where: {
            participants: {
                some: { petId },
            },
        },
        include: {
            participants: {
                include: {
                    pet: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            owner: {
                                select: {
                                    id: true,
                                    lastSeen: true,
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
                            image: true,
                        },
                    },
                },
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
                    senderPetId: { not: petId },
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
    petId: number,
    page = 1,
) => {
    const PAGE_SIZE = 30;
    const participant = await prisma.conversationParticipant.findUnique({
        where: {
            petId_conversationId: {
                petId,
                conversationId,
            },
        },
    });
    if (!participant) {
        throw new Error('No tenés acceso a esta conversación');
    }

    const messages = await prisma.message.findMany({
        where: { conversationId },
        take: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
        orderBy: { createdAt: 'desc' },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },
        },
    });

    return messages.reverse();
};

export const deleteConversation = async (
    conversationId: number,
    petId: number,
) => {
    const participant = await prisma.conversationParticipant.findUnique({
        where: {
            petId_conversationId: {
                petId,
                conversationId,
            },
        },
    });
    if (!participant) {
        throw new Error('No tenés acceso a esta conversación');
    }

    await prisma.message.deleteMany({ where: { conversationId } });
    await prisma.conversationParticipant.deleteMany({ where: { conversationId } });
    await prisma.conversation.delete({ where: { id: conversationId } });
};

export const sendMessage = async (
    conversationId: number,
    senderPetId: number,
    content: string,
) => {
    const message = await prisma.message.create({
        data: {
            content,
            conversationId,
            senderPetId,
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },
        },
    });

    await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
    });

    return message;
};

export const markConversationAsRead = async (
    conversationId: number,
    petId: number,
) => {
    await prisma.message.updateMany({
        where: {
            conversationId,
            senderPetId: { not: petId },
            isRead: false,
        },
        data: { isRead: true },
    });
};

export const getUnreadMessagesCount = async (petId: number) => {
    const count = await prisma.message.count({
        where: {
            conversation: {
                participants: {
                    some: { petId },
                },
            },
            senderPetId: { not: petId },
            isRead: false,
        },
    });
    return count;
};
