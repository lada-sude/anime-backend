import express from 'express';
import bcrypt from 'bcryptjs';
import { users, User } from '../models/user';
import { signToken } from '../utils/authMiddleware';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) return res.status(400).json({ error: 'User exists' });

  const hash = await bcrypt.hash(password, 10);
  const newUser: User = { id: uuidv4(), username, passwordHash: hash, plan: 'free', quota: 100 };
  users.push(newUser);
  const token = signToken(newUser.id, newUser.username);
  res.json({ token, plan: newUser.plan, quota: newUser.quota });
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ error: 'User not found' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(400).json({ error: 'Wrong password' });

  const token = signToken(user.id, user.username);
  res.json({ token, plan: user.plan, quota: user.quota });
});

export default router;
