import { prisma } from '../config/prisma';

export const createNotification = async (
    receiverId: number,
    actorName: string,
    type: string,
) => {
    let message = '';

    if (type === 'LIKE') {
        message = `🐶 ${actorName} le dio like a tu publicación`;
    }

    if (type === 'COMMENT') {
        message = `💬 ${actorName} comentó tu publicación`;
    }

    if (type === 'FOLLOW') {
        message = `👤 ${actorName} empezó a seguirte`;
    }

    return prisma.notification.create({
        data: {
            userId: receiverId,
            type,
            message,
        },
    });
};

export const getUserNotifications = async (userId: number) => {
    return prisma.notification.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

export const markAsRead = async (id: string) => {
    return prisma.notification.update({
        where: { id },
        data: {
            isRead: true,
        },
    });
};
