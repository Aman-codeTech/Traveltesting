import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbManager } from '../db/database';
import { generateToken, AuthRequest } from '../middleware/auth';

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = 'TOURIST', phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email and password are required.' });
      return;
    }

    const existing = dbManager.queryOne('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing) {
      res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const validRoles = ['SUPER_ADMIN', 'CONTENT_MANAGER', 'BUSINESS_MODERATOR', 'BUSINESS_OWNER', 'TOURIST'];
    const assignedRole = validRoles.includes(role) ? role : 'TOURIST';

    const result = dbManager.run(
      'INSERT INTO users (name, email, password_hash, role, phone, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email.toLowerCase(), hash, assignedRole, phone || '', 'ACTIVE']
    );

    const userId = result.lastInsertRowid;
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

    dbManager.run(
      'INSERT INTO profiles (user_id, bio, avatar_url, location) VALUES (?, ?, ?, ?)',
      [userId, `Namaste! I am exploring India with TravelSaathi AI.`, avatarUrl, 'India']
    );

    const user = {
      id: userId,
      name,
      email: email.toLowerCase(),
      role: assignedRole,
      status: 'ACTIVE',
    };

    const token = generateToken(user as any);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user,
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: 'Server error during signup.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const user = dbManager.queryOne<any>(
      'SELECT id, name, email, password_hash, role, status FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (user.status !== 'ACTIVE') {
      res.status(403).json({ success: false, message: `Your account is ${user.status.toLowerCase()}. Please contact support.` });
      return;
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const authUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    const token = generateToken(authUser as any);

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: authUser,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const userProfile = dbManager.queryOne<any>(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.status, u.created_at,
              p.bio, p.avatar_url, p.location
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    res.json({ success: true, user: userProfile });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { name, phone, bio, avatar_url, location } = req.body;

    if (name) {
      dbManager.run('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name, phone || '', req.user.id]);
    }

    dbManager.run(
      `UPDATE profiles SET bio = ?, avatar_url = ?, location = ? WHERE user_id = ?`,
      [bio || '', avatar_url || '', location || '', req.user.id]
    );

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};
