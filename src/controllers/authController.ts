import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../middleware/auth';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const user = new User({ username, email, password });
    await user.save();
    console.log(`\x1b[42m\x1b[30m✔ USER CREATED:\x1b[0m \x1b[32m${username}\x1b[0m`);
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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
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