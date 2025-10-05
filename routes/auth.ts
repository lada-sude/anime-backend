import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { users, createUser, saveUsers } from '../models/user';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const SECRET = 'your_jwt_secret_key';

// Signup
router.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const user = createUser(username, password);
  const token = jwt.sign({ id: user.id, username }, SECRET, { expiresIn: '30d' });
  res.json({ token, plan: user.plan, quota: user.quota });
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = jwt.sign({ id: user.id, username }, SECRET, { expiresIn: '30d' });
  res.json({ token, plan: user.plan, quota: user.quota });
});

export default router;
