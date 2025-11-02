import express from "express";
import multer from "multer";
import { verifyToken } from "../utils/authMiddleware";
import { UserModel } from "../models/user";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// ✅ IMAGE SEARCH
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const user = await UserModel.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    // ✅ Reset quota daily
    const today = new Date().toISOString().split("T")[0];
    if (!user.lastReset || user.lastReset.split("T")[0] !== today) {
      user.quota = user.plan === "premium" ? 20 : 5;
      user.lastReset = new Date().toISOString();
      await user.save();
    }

    // ✅ Check quota before search
    if (user.quota <= 0) {
      return res.status(403).json({
        error: "quota_exceeded",
        message: "You have used all your searches for today.",
      });
    }

    if (!req.file?.path) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // ✅ Upload image to Trace.moe
    const form = new FormData();
    form.append("image", fs.createReadStream(req.file.path));

    const response = await axios.post(
      "https://api.trace.moe/search?anilistInfo&cutBorders",
      form,
      { headers: form.getHeaders() }
    );

    // ✅ Deduct quota
    user.quota -= 1;
    await user.save();

    fs.unlinkSync(req.file.path); // delete temp file safely

    res.json({
      results: response.data.result,
      quota: user.quota,
      resetDate: user.lastReset,
    });
  } catch (err: any) {
    console.error("Trace.moe error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Trace.moe search failed",
      details: err.response?.data || err.message,
    });
  }
});

export default router;
