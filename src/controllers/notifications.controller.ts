import { NextFunction, Request, Response } from 'express';
import * as notificationService from '../services/notifications.services';

export const getNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = parseInt(req.params.userId);

        const notifications =
            await notificationService.getUserNotifications(userId);

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
