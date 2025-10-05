import express from "express";
import { users, saveUsers } from "../models/user";

const router = express.Router();

// Admin-only route for upgrading a user's plan
router.post("/upgrade", (req, res) => {
  const { username, extraQuota } = req.body;

  const user = users.find((u) => u.username === username);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.plan = "premium"; // consistent with user.ts
  user.quota += extraQuota || 20; // 1 dollar = 20 searches
  saveUsers();

  res.json({ message: `${username} upgraded successfully`, user });
});

export default router;
