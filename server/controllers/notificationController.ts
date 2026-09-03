import { Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { db } from '../db/store';
import { AuthRequest } from '../middleware/auth';
import { emitNotification } from '../socket';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || (req.query.userId as string);
    const role = req.user?.role || (req.query.role as string);

    // Try MongoDB first if available
    try {
      const query: any = {};
      if (userId && userId !== 'all') {
        query.$or = [{ userId }, { recipientRole: role }, { recipientRole: 'all' }];
      } else if (role) {
        query.$or = [{ recipientRole: role }, { recipientRole: 'all' }];
      }

      const mongoNotifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
      if (mongoNotifications.length > 0) {
        return res.json({
          success: true,
          count: mongoNotifications.length,
          source: 'MongoDB Atlas - Notification Registry',
          data: mongoNotifications,
        });
      }
    } catch {
      // Fallback to store
    }

    const list = db.getNotifications({ userId, role });
    return res.json({
      success: true,
      count: list.length,
      source: 'In-Memory State Store',
      data: list,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const markNotificationAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    try {
      await Notification.findByIdAndUpdate(id, { isRead: true });
    } catch {
      // Fallback
    }

    const success = db.markNotificationRead(id);

    return res.json({
      success: true,
      message: 'Notification marked as read.',
      id,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || (req.body.userId as string);

    try {
      if (userId) {
        await Notification.updateMany({ userId, isRead: false }, { isRead: true });
      }
    } catch {
      // Fallback
    }

    if (userId) {
      db.markAllNotificationsRead(userId);
    }

    return res.json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createNotification = async (req: AuthRequest, res: Response) => {
  try {
    const payload = req.body;
    if (!payload.userId || !payload.title || !payload.message) {
      return res.status(400).json({
        success: false,
        error: 'userId, title, and message are required.',
      });
    }

    const notif = db.addNotification(payload);

    try {
      const mongoNotif = new Notification({
        ...payload,
        isRead: false,
      });
      await mongoNotif.save();
    } catch {
      // Fallback
    }

    // Emit via Socket.IO
    emitNotification(payload.userId, notif);

    return res.status(201).json({
      success: true,
      data: notif,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
