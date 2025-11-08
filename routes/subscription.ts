// routes/subscription.ts
import express from "express";
import { UserModel } from "../models/user";

const router = express.Router();

// helper to find user by uuid or _id
async function findUserByIdOrCustom(idOrUuid: string) {
  let user = null;
  try {
    user = await UserModel.findById(idOrUuid);
  } catch {}
  if (!user) user = await UserModel.findOne({ id: idOrUuid });
  return user;
}

// ✅ GET all users
router.get("/users", async (req, res) => {
  try {
    const users = await UserModel.find();
    res.json({
      users,
      serverLog: `📡 Admin fetched user list (${users.length} total)`,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch users",
      serverLog: `❌ Fetch users failed: ${err.message}`,
    });
  }
});

// ✅ Upgrade user plan
router.post("/upgrade/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { plan, setQuota } = req.body;
    const user = await findUserByIdOrCustom(userId);

    if (!user)
      return res
        .status(404)
        .json({ error: "User not found", serverLog: `❌ No user found for id ${userId}` });

    let logMessage = "";
    if (plan === "premium") {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      user.plan = "premium";
      user.quota = 20;
      user.premiumExpires = expiry.toISOString();
      logMessage = `⭐ ${user.username} upgraded to PREMIUM until ${expiry.toDateString()}`;
    } else if (plan === "free") {
      user.plan = "free";
      user.quota = 5;
      user.premiumExpires = "";
      logMessage = `⬇️ ${user.username} downgraded to FREE`;
    } else if (setQuota !== undefined) {
      const n = Number(setQuota);
      if (isNaN(n))
        return res.status(400).json({ error: "Invalid quota", serverLog: "⚠️ Invalid setQuota" });
      user.quota = n;
      logMessage = `🧩 ${user.username} quota manually set to ${n}`;
    } else {
      return res
        .status(400)
        .json({ error: "No action provided", serverLog: "⚠️ Missing plan or setQuota" });
    }

    await user.save();

    res.json({
      success: true,
      message: `User ${user.username} updated successfully.`,
      plan: user.plan,
      quota: user.quota,
      serverLog: logMessage,
    });
  } catch (err: any) {
    res.status(500).json({
      error: "Upgrade failed",
      serverLog: `❌ Upgrade failed: ${err.message}`,
    });
  }
});

// ✅ Reset all users
router.post("/reset-all", async (req, res) => {
  try {
    const users = await UserModel.find();
    const now = new Date();
    let countReset = 0,
      expiredCount = 0;

    for (const u of users) {
      if (u.plan === "premium" && u.premiumExpires) {
        const expiry = new Date(u.premiumExpires);
        if (now > expiry) {
          u.plan = "free";
          u.quota = 5;
          u.premiumExpires = "";
          expiredCount++;
        }
      }
      u.quota = u.plan === "premium" ? 20 : 5;
      u.lastReset = new Date().toISOString();
      await u.save();
      countReset++;
    }

    res.json({
      message: "All users reset successfully.",
      serverLog: `♻️ Reset complete. ${countReset} users updated, ${expiredCount} downgraded.`,
    });
  } catch (err: any) {
    res.status(500).json({
      error: "Reset failed",
      serverLog: `❌ Reset failed: ${err.message}`,
    });
  }
});

// ✅ Reset single user
router.post("/reset-user/:id", async (req, res) => {
  try {
    const user = await findUserByIdOrCustom(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ error: "User not found", serverLog: `❌ No user found for id ${req.params.id}` });

    user.plan = "free";
    user.quota = 5;
    user.premiumExpires = "";
    user.lastReset = new Date().toISOString();
    await user.save();

    res.json({
      success: true,
      message: `${user.username} reset to FREE`,
      serverLog: `🔁 ${user.username} manually reset to free by admin`,
    });
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to reset user",
      serverLog: `❌ Reset user failed: ${err.message}`,
    });
  }
});

export default router;




// MONGODB_URI=mongodb+srv://vnnachi70_db_user:QDpskslbvDBcTqgw@cluster0.tmwirij.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
