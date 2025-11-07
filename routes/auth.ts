// routes/auth.ts
import express from "express";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/user";
import { signToken } from "../utils/authMiddleware"; // ✅ use shared token function

const router = express.Router();

// ✅ SIGNUP (with device lock)
router.post("/signup", async (req, res) => {
  try {
    const { username, password, deviceId } = req.body;
    if (!username || !password || !deviceId) {
      return res.status(400).json({
        error: "Username, password, and device ID required",
      });
    }

    // 🚫 Prevent multiple accounts on the same device
    const existingDevice = await UserModel.findOne({ deviceId });
    if (existingDevice) {
      return res.status(403).json({
        error: "Device already registered",
        message: "Only one free account is allowed per device.",
      });
    }

    // 🚫 Prevent duplicate usernames
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // ✅ Create new user
    const newUser = new UserModel({ username, password, deviceId });
    await newUser.save();

    // ✅ Include deviceId in token
    const token = signToken(newUser.id, username, deviceId);

    const message = `Welcome, ${username}! Plan: ${newUser.plan.toUpperCase()}`;
    res.json({ token, plan: newUser.plan, quota: newUser.quota, message });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password, deviceId } = req.body;
    if (!username || !password || !deviceId)
      return res.status(400).json({ error: "Username, password, and device ID required" });

    const user = await UserModel.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid password" });

    // ✅ Update deviceId if missing (for older users)
    if (!user.deviceId) {
      user.deviceId = deviceId;
      await user.save();
    }

    // ✅ Include deviceId in token
    const token = signToken(user.id, username, user.deviceId);

    const message = `Welcome back, ${username}! Plan: ${user.plan.toUpperCase()}`;
    res.json({ token, plan: user.plan, quota: user.quota, message });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
