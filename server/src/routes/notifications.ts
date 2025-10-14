import express from 'express';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import { Notification } from '../models/Notification';

const router = express.Router();

// Get user notifications
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 20, read } = req.query;
    const query: any = { toUserId: req.user!._id };

    if (read !== undefined) {
      query.read = read === 'true';
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ toUserId: req.user!._id, read: false });

    res.json({
      notifications,
      unreadCount,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, toUserId: req.user!._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark all notifications as read
router.patch('/read-all', authenticateToken, async (req: AuthRequest, res) => {
  try {
    await Notification.updateMany(
      { toUserId: req.user!._id, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      toUserId: req.user!._id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get notification count
router.get('/count', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      toUserId: req.user!._id,
      read: false,
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Get notification count error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get unread notification count (alternative endpoint)
router.get('/unread-count', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      toUserId: req.user!._id,
      read: false,
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread notification count error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
