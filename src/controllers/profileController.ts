import { Request, Response } from 'express';
import User from '../models/User';
import Notification from '../models/Notification';
import Achievement from '../models/Achievement';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Error fetching profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['username', 'email', 'location'] as const;
  type AllowedUpdate = typeof allowedUpdates[number];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update as AllowedUpdate));
  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    updates.forEach(update => {
      const key = update as AllowedUpdate;
      (user as any)[key] = req.body[key];
    });
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Error updating profile' });
  }
};

export const getUserAchievements = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('achievements');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.achievements);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching achievements' });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate({
      path: 'notifications',
      options: { sort: { createdAt: -1 } },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.notifications);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching notifications' });
  }
};

export const markNotificationsRead = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await Notification.updateMany(
      { user: user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Error marking notifications as read' });
  }
};

export const getUserActivity = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate({
      path: 'recentActivity',
      options: { sort: { createdAt: -1 }, limit: 50 },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.recentActivity);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching activity' });
  }
}; 