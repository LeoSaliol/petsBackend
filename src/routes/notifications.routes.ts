import { Router } from 'express';
import * as notificationController from '../controllers/notifications.controller';

const router = Router();

router.get('/:userId', notificationController.getNotifications);

router.patch('/:id/read', notificationController.readNotification);

export default router;
