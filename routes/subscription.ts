import express from "express";
import { users, saveUsers } from "../models/user";

const router = express.Router();

/**
 * ✅ GET all users (Admin only)
 */
router.get("/users", (req, res) => {
  console.log("📡 Admin requested user list. Total users:", users.length);
  res.json({ users });
});

/**
 * ✅ POST upgrade user plan
 * body: { plan?: "free" | "premium", setQuota?: number }
 */
router.post("/upgrade/:id", (req, res) => {
  const userId = req.params.id;
  const { plan, setQuota } = req.body;

  const user = users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  // ⭐ Upgrade to premium
  if (plan === "premium") {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30); // 30 days from now
    user.plan = "premium";
    user.quota = 20;
    user.premiumExpires = expiry.toISOString();
    console.log(`⭐ ${user.username} upgraded to premium until ${expiry.toDateString()}`);
  }

  // ⬇️ Downgrade to free
  else if (plan === "free") {
    user.plan = "free";
    user.quota = 5;
    user.premiumExpires = ""; // empty string avoids TS error
    console.log(`⬇️ ${user.username} reverted to free plan`);
  }

  // 🎯 Set custom quota (admin override)
  else if (setQuota && !isNaN(setQuota)) {
    user.quota = Number(setQuota);
  }

  // 💾 Save changes
  saveUsers();

  // ✅ Respond with full data so Admin dashboard updates properly
  res.json({
    success: true,
    message: `Welcome back, ${user.username}! Plan: ${user.plan.toUpperCase()}`,
    user, // send updated user
    users, // also send all users (for instant dashboard refresh)
  });
});

/**
 * ✅ Manual reset for all users (handles expired premium plans)
 */
router.post("/reset-all", (req, res) => {
  const today = new Date().toISOString();

  users.forEach((u) => {
    // ⏳ Handle expired premium
    if (u.plan === "premium" && u.premiumExpires) {
      const expiryDate = new Date(u.premiumExpires);
      if (new Date() > expiryDate) {
        u.plan = "free";
        u.quota = 5;
        u.premiumExpires = "";
        console.log(`⚠️ Premium expired for ${u.username}`);
      }
    }

    // 🔁 Reset based on plan
    u.quota = u.plan === "premium" ? 20 : 5;
    u.lastReset = today;
  });

  saveUsers();
  console.log("♻️ All user quotas reset and expired premiums downgraded.");
  res.json({ message: "All user quotas reset successfully.", users });
});

export default router;
