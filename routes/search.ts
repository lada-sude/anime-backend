import express from "express";
import multer from "multer";
import { verifyToken } from "../utils/authMiddleware";
import { UserModel } from "../models/user";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// ✅ IMAGE SEARCH (trace.moe)
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const user = await UserModel.findOne({ id: userId }); // ✅ FIXED lookup
    if (!user) return res.status(404).json({ error: "User not found" });

    // ...rest stays the same...


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

    // ✅ Upload to trace.moe
    const form = new FormData();
    form.append("image", fs.createReadStream(req.file.path));

    let response;
    try {
      response = await axios.post(
        "https://api.trace.moe/search?anilistInfo&cutBorders",
        form,
        { headers: form.getHeaders() }
      );
    } catch (err: any) {
      console.error("Trace.moe API failed:", err.response?.data || err.message);
      throw new Error("trace_moe_failed");
    }

    // ✅ Deduct quota
    user.quota -= 1;
    await user.save();

    // ✅ Cleanup
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      results: response.data.result,
      user: {
        username: user.username,
        plan: user.plan,
        quota: user.quota,
        lastReset: user.lastReset,
      },
    });
  } catch (err: any) {
    console.error("Search route error:", err.message);
    res.status(500).json({
      error: "Trace.moe search failed",
      details: err.message,
    });
  }
});

export default router;
