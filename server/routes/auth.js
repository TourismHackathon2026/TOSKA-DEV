import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { auth, JWT_SECRET } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, email, password, phone, emergency_contact } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const result = db.prepare(`
      INSERT INTO users (name, email, password, phone, emergency_contact)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, email, hashedPassword, phone || null, emergency_contact || null);

    const user = db.prepare('SELECT id, name, email, role, avatar FROM users WHERE id = ?').get(result.lastInsertRowid);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', auth, (req, res) => {
  try {
    const user = db.prepare(
      'SELECT id, name, email, phone, emergency_contact, avatar, role, created_at FROM users WHERE id = ?'
    ).get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/auth/profile
router.put('/profile', auth, (req, res) => {
  try {
    const { name, phone, emergency_contact } = req.body;

    db.prepare(`
      UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), emergency_contact = COALESCE(?, emergency_contact)
      WHERE id = ?
    `).run(name || null, phone || null, emergency_contact || null, req.user.id);

    const user = db.prepare(
      'SELECT id, name, email, phone, emergency_contact, avatar, role, created_at FROM users WHERE id = ?'
    ).get(req.user.id);

    res.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
