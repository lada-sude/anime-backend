import express from 'express';
import multer from 'multer';
import { verifyToken } from '../utils/authMiddleware';
import { users } from '../models/user';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  const userId = (req as any).user.id;
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (user.quota <= 0) return res.status(403).json({ error: 'Quota exceeded' });

  if (!req.file?.path) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // prepare file upload
    const form = new FormData();
    form.append('image', fs.createReadStream(req.file.path));

    // ✅ Free public endpoint (no API key needed)
    const response = await axios.post(
      'https://api.trace.moe/search?anilistInfo&cutBorders',
      form,
      { headers: form.getHeaders() }
    );

    // reduce quota
    user.quota -= 1;

    // delete temp file safely
    fs.unlinkSync(req.file.path);

    res.json({ results: response.data.result, quota: user.quota });
  } catch (err: any) {
    console.error('Trace.moe error:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Trace.moe search failed',
      details: err.response?.data || err.message,
    });
  }
});

export default router;
