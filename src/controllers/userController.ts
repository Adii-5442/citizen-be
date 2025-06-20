import { Request, Response } from 'express';
import User from '../models/User';
import Activity from '../models/Activity';
import Notification from '../models/Notification';

export const followUser = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId; // Auth middleware should set req.user
    const targetId = req.params.id;
    if (userId === targetId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }
    const user = await User.findById(userId);
    const target = await User.findById(targetId);
    if (!user || !target) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (target.followers.includes(user._id)) {
      return res.status(400).json({ error: 'Already following' });
    }
    target.followers.push(user._id);
    user.following.push(target._id);
    await target.save();
    await user.save();
    // Create activity for follower
    await Activity.create({
      user: user._id,
      type: 'follow',
      message: `You followed ${target.username}`,
      relatedUser: target._id,
    });
    // Create notification for followed user
    await Notification.create({
      user: target._id,
      type: 'follow',
      message: `${user.username} started following you`,
      relatedUser: user._id,
    });
    res.json({ message: 'Followed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error following user' });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const targetId = req.params.id;
    if (userId === targetId) {
      return res.status(400).json({ error: 'Cannot unfollow yourself' });
    }
    const user = await User.findById(userId);
    const target = await User.findById(targetId);
    if (!user || !target) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!target.followers.includes(user._id)) {
      return res.status(400).json({ error: 'Not following' });
    }
    target.followers = target.followers.filter(f => !f.equals(user._id));
    user.following = user.following.filter(f => !f.equals(target._id));
    await target.save();
    await user.save();
    // Create activity for unfollow
    await Activity.create({
      user: user._id,
      type: 'follow',
      message: `You unfollowed ${target.username}`,
      relatedUser: target._id,
    });
    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error unfollowing user' });
  }
}; 