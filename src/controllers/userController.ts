import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../middleware/auth';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
    });

    await user.save();
    const token = generateToken(user._id);

    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        points: user.points,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ error: 'Error creating user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        points: user.points,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ error: 'Error logging in' });
  }
};

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