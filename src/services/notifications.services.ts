import { prisma } from '../config/prisma';
import { io } from '../server';

export const createNotification = async (
    receiverId: number,
    actorId: number,
    type: string,
    postId?: number,
) => {
    let message = '';

    const actor = await prisma.pet.findUnique({
        where: { id: actorId },
    });

    if (type === 'LIKE') {
        message = ` ${actor?.name} le dio like a tu publicación`;
    }

    if (type === 'COMMENT') {
        message = ` ${actor?.name} comentó tu publicación`;
    }

    if (type === 'FOLLOW') {
        message = ` ${actor?.name} empezó a seguirte`;
    }

    const notification = await prisma.notification.create({
        data: {
            petId: receiverId,
            actorId,
            postId: postId || null,
            type,
            message,
        },
        include: {
            actor: true,
            post: true,
        },
    });
    io.to(`user-${receiverId}`).emit('notification', notification);
    return notification;
};

export const getUserNotifications = async (petId: number, limit?: number) => {
    const notifications = await prisma.notification.findMany({
        where: { petId },
        include: {
            actor: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },
            post: {
                select: {
                    id: true,
                    image: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    // 🔥 AGRUPACIÓN
    const grouped = new Map();

    for (const notif of notifications) {
        const key = `${notif.type}-${notif.postId ?? 'no-post'}`;

        if (!grouped.has(key)) {
            grouped.set(key, {
                ...notif,
                actors: notif.actor ? [notif.actor] : [],
                count: 1,
                latestDate: notif.createdAt,
            });
        } else {
            const existing = grouped.get(key);

            // evitar duplicados de actor
            if (
                notif.actor &&
                !existing.actors.some((a: any) => a.id === notif.actor?.id)
            ) {
                existing.actors.push(notif.actor);
            }

            existing.count += 1;

            // mantener la más reciente
            if (notif.createdAt > existing.latestDate) {
                existing.latestDate = notif.createdAt;
            }
        }
    }

    // convertir a array + ordenar otra vez
    const result = Array.from(grouped.values())
        .sort((a, b) => b.latestDate - a.latestDate)
        .slice(0, limit);

    return result.map((notif) => ({
        id: notif.id,
        type: notif.type === 'LIKE' ? 'like' : notif.type === 'COMMENT' ? 'comment' : 'follow',
        message: notif.message,
        createdAt: notif.createdAt.toISOString(),
        isRead: notif.isRead,
        actor: notif.actor
            ? { id: notif.actor.id, name: notif.actor.name, image: notif.actor.image }
            : null,
        actors: (notif.actors || [])
            .filter((a: any) => a && a.id)
            .map((a: any) => ({ id: a.id, name: a.name, image: a.image })),
        postId: notif.postId ?? notif.post?.id ?? undefined,
        post: notif.post
            ? { id: notif.post.id, image: notif.post.image }
            : undefined,
        count: notif.count,
    }));
};
// export const getUserNotifications = async (petId: number, limit?: number) => {
//     return prisma.notification.findMany({
//         where: {
//             petId,
//         },
//         take: limit,
//         include: {
//             actor: {
//                 select: {
//                     id: true,
//                     name: true,
//                     image: true,
//                 },
//             },
//             post: {
//                 select: {
//                     id: true,
//                     image: true,
//                 },
//             },
//         },
//         orderBy: {
//             createdAt: 'desc',
//         },
//     });
// };

export const markAsRead = async (id: string) => {
    return prisma.notification.update({
        where: { id },
        data: {
            isRead: true,
        },
    });
};

export const getUnreadNotificationsCount = async (petId: number) => {
    const count = await prisma.notification.count({
        where: {
            petId,
            isRead: false,
        },
    });
    return count;
};

export const markAllAsRead = async (petId: number) => {
    const result = await prisma.notification.updateMany({
        where: {
            petId,
            isRead: false,
        },
        data: {
            isRead: true,
        },
    });
    return result;
};
