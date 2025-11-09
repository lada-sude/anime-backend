// routes/subscription.ts
import express from "express";
import { UserModel } from "../models/user";

const router = express.Router();

/**
 * ✅ GET all users (Admin only)
 */
router.get("/users", async (req, res) => {
  try {
    const users = await UserModel.find();
    console.log("📡 Admin requested user list. Total users:", users.length);
    res.json({ users });
  } catch (err) {
    console.error("❌ Failed to fetch users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/**
 * ✅ POST upgrade user plan (UUID compatible)
 */
router.post("/upgrade/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { plan, setQuota } = req.body;

    // 🔧 Support both Mongo _id and custom UUID id
    const user = await UserModel.findOne({ $or: [{ _id: userId }, { id: userId }] });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (plan === "premium") {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      user.plan = "premium";
      user.quota = 20;
      user.premiumExpires = expiry.toISOString();
      console.log(`⭐ ${user.username} upgraded to premium until ${expiry.toDateString()}`);
    } else if (plan === "free") {
      user.plan = "free";
      user.quota = 5;
      user.premiumExpires = "";
      console.log(`⬇️ ${user.username} reverted to free plan`);
    } else if (setQuota && !isNaN(setQuota)) {
      user.quota = Number(setQuota);
    }

    await user.save();

    res.json({
      success: true,
      message: `${user.username} upgraded successfully!`,
      user,
    });
  } catch (err) {
    console.error("❌ Error upgrading user:", err);
    res.status(500).json({ error: "Failed to upgrade user" });
  }
});

/**
 * ✅ Reset all users (downgrade expired premium)
 */
router.post("/reset-all", async (req, res) => {
  try {
    const users = await UserModel.find();
    const now = new Date();

    for (const u of users) {
      if (u.plan === "premium" && u.premiumExpires) {
        const expiry = new Date(u.premiumExpires);
        if (now > expiry) {
          u.plan = "free";
          u.quota = 5;
          u.premiumExpires = "";
          console.log(`⚠️ Premium expired for ${u.username}`);
        }
      }

      u.quota = u.plan === "premium" ? 20 : 5;
      u.lastReset = new Date().toISOString();
      await u.save();
    }

    console.log("♻️ All user quotas reset and expired premiums downgraded.");
    res.json({ message: "All user quotas reset successfully." });
  } catch (err) {
    console.error("❌ Failed to reset users:", err);
    res.status(500).json({ error: "Failed to reset users" });
  }
});

/**
 * ✅ Reset a single user to free (Admin)
 */
router.post("/reset-user/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await UserModel.findOne({ $or: [{ _id: userId }, { id: userId }] });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.plan = "free";
    user.quota = 5;
    user.premiumExpires = "";
    user.lastReset = new Date().toISOString();

    await user.save();
    console.log(`🔁 ${user.username} manually reset to Free plan by admin.`);

    res.json({
      success: true,
      message: `${user.username} has been reset to FREE plan.`,
      user,
    });
  } catch (err) {
    console.error("❌ Failed to reset user:", err);
    res.status(500).json({ error: "Failed to reset user" });
  }
});

export default router;





// MONGODB_URI=mongodb+srv://vnnachi70_db_user:QDpskslbvDBcTqgw@cluster0.tmwirij.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
