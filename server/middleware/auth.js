import jwt from 'jsonwebtoken';
import { db } from '../data/storageEngine.js';

const JWT_SECRET = process.env.JWT_SECRET || 'liferpg_super_secret_mythic_key_2026';

export const generateToken = (user) => {
  return jwt.sign({ id: user._id || user.id, email: user.email }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const requireAuth = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trim();
    }

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};
