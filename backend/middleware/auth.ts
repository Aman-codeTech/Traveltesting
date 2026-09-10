import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbManager } from '../db/database';

const JWT_SECRET = process.env.JWT_SECRET || 'travelsaathi_super_secure_secret_jwt_key_2026';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'CONTENT_MANAGER' | 'BUSINESS_MODERATOR' | 'BUSINESS_OWNER' | 'TOURIST';
  status: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authorization required. Please log in.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string };
    const user = dbManager.queryOne<AuthUser>(
      'SELECT id, name, email, role, status FROM users WHERE id = ? AND status = ?',
      [decoded.id, 'ACTIVE']
    );

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
  }
}

export function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const user = dbManager.queryOne<AuthUser>(
      'SELECT id, name, email, role, status FROM users WHERE id = ? AND status = ?',
      [decoded.id, 'ACTIVE']
    );
    if (user) {
      req.user = user;
    }
  } catch {
    // Ignore invalid optional token
  }
  next();
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Requires one of: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
}
