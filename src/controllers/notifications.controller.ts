import { NextFunction, Request, Response } from 'express';
import * as notificationService from '../services/notifications.services';

export const getNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = parseInt(req.params.petId);
        const limit = req.query.limit
            ? parseInt(String(req.query.limit))
            : undefined;
        const notifications = await notificationService.getUserNotifications(
            userId,
            limit,
        );

        res.json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        next(error);
    }
};

export const readNotification = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params;

        const notification = await notificationService.markAsRead(id);

        res.json({
            success: true,
            data: notification,
        });
    } catch (error) {
        next(error);
    }
};

export const readAllNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const petId = parseInt(req.params.petId);
        const result = await notificationService.markAllAsRead(petId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getUnreadCount = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const petId = parseInt(req.params.petId);
        const count = await notificationService.getUnreadNotificationsCount(petId);
        res.json({ success: true, data: count });
    } catch (error) {
        next(error);
    }
};
