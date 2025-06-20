import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { Types } from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    _id: Types.ObjectId;
  };
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { _id: string };
    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      throw new Error();
    }

    req.user = { _id: user._id };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ _id: userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d',
  });
}; 