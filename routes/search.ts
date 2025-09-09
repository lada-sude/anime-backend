import express from 'express';
import multer from 'multer';
import { verifyToken } from '../utils/authMiddleware';
import { searchTraceMoe } from '../utils/traceMoe';
import { users } from '../models/user';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  const userId = (req as any).user.id;
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (user.quota <= 0) return res.status(403).json({ error: 'Quota exceeded' });

  // ✅ Fix: safely handle req.file
  if (!req.file?.path) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const result = await searchTraceMoe(req.file.path);
    user.quota -= 1;

    // delete temp file safely
    fs.unlinkSync(req.file.path);

    res.json({ results: result.result, quota: user.quota });
  } catch (err) {
    res.status(500).json({ error: 'Trace.moe search failed', details: err });
  }
});

export default router;
