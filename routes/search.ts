// routes/search.ts
import express from "express";
import multer from "multer";
import { verifyToken } from "../utils/authMiddleware";
import { UserModel } from "../models/user";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/**
 * ✅ Quota Check (no Trace.moe call)
 * Frontend will handle the actual image search.
 */
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const user = (await UserModel.findOne({ id: userId })) || (await UserModel.findById(userId));

    if (!user) return res.status(404).json({ error: "User not found" });

    // Reset quota daily
    const today = new Date().toISOString().split("T")[0];
    if (!user.lastReset || user.lastReset.split("T")[0] !== today) {
      user.quota = user.plan === "premium" ? 20 : 5;
      user.lastReset = new Date().toISOString();
      await user.save();
    }

    if (user.quota <= 0) {
      return res.status(403).json({
        error: "quota_exceeded",
        message: "You have used all your searches for today.",
      });
    }

    // ✅ Deduct quota here (only)
    user.quota -= 1;
    await user.save();

    // ✅ Safely delete uploaded file if it exists
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      success: true,
      quotaLeft: user.quota,
      message: "Quota deducted. You may now call trace.moe directly.",
    });
  } catch (err) {
    console.error("Search quota error:", err);
    res.status(500).json({ error: "Server error while deducting quota" });
  }
});

export default router;
