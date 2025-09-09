import express from 'express';
import { verifyToken } from '../utils/authMiddleware';
import { users } from '../models/user';

const router = express.Router();

// Simulate subscription purchase
router.post('/buy', verifyToken, (req, res) => {
  const userId = (req as any).user.id;
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Upgrade plan
  user.plan = 'paid';
  user.quota = 1000; // shared paid plan
  res.json({ plan: user.plan, quota: user.quota });
});

export default router;
