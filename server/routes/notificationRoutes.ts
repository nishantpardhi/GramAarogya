import { Router } from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  createNotification,
} from '../controllers/notificationController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, getNotifications);
router.patch('/:id/read', optionalAuth, markNotificationAsRead);
router.post('/mark-all-read', optionalAuth, markAllAsRead);
router.post('/', optionalAuth, createNotification);

export default router;
