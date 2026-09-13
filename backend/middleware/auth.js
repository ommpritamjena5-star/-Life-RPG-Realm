import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'liferpg_mythic_jwt_secret_key_2026_super_secure';

export const generateToken = (user) => {
  return jwt.sign({ id: String(user._id || user.id), email: user.email }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const requireAuth = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trim();
    }

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      // Fallback in case old token used previous default secret
      try {
        decoded = jwt.verify(token, 'liferpg_super_secret_mythic_key_2026');
      } catch {
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
      }
    }

    let user = null;

    if (decoded.id && decoded.id.length === 24) {
      try {
        user = await User.findById(decoded.id).lean();
      } catch {}
    }
    if (!user && decoded.email) {
      try {
        user = await User.findOne({ email: decoded.email.toLowerCase() }).lean();
      } catch {}
    }

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found in database' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};
