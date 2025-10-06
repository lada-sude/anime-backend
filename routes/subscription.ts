import express from "express";
import { users, saveUsers } from "../models/user";

const router = express.Router();

/**
 * ✅ GET all users (Admin only)
 */
router.get("/users", (req, res) => {
  res.json(users);
});

/**
 * ✅ POST upgrade user plan
 * body: { plan?: "free" | "premium", addQuota?: number }
 */
router.post("/upgrade/:id", (req, res) => {
  const userId = req.params.id;
  const { plan, addQuota } = req.body;

  const user = users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (plan) {
    user.plan = plan;
  }

  if (addQuota && !isNaN(addQuota)) {
    user.quota += Number(addQuota);
  }

  saveUsers();
  res.json({ message: "User updated successfully", user });
});

/**
 * ✅ (Optional) Reset all free users’ quotas manually
 */
router.post("/reset-all", (req, res) => {
  const today = new Date().toISOString();

  users.forEach((u) => {
    if (u.plan === "free") {
      u.quota = 5;
      u.lastReset = today;
    }
  });

  saveUsers();
  res.json({ message: "All free users’ quotas reset" });
});

export default router;
