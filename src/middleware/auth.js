import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new Error();
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = typeof decoded === 'object' && decoded._id ? decoded._id : undefined;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new Error();
    }
    req.user = { _id: user._id };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

export const generateToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d',
  });
}; 