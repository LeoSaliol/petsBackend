import { Router } from 'express';
import * as notificationController from '../controllers/notifications.controller';
import { attachPet } from '../middlewares/attachPet';

const router = Router();

router.use(attachPet);
router.get('/:petId', notificationController.getNotifications);

router.patch('/:id/read', notificationController.readNotification);

export default router;
