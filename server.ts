import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import searchRoutes from "./routes/search";
import subscriptionRoutes from "./routes/subscription";
import subscriptionRequestRoutes from "./routes/subscriptionRequest";
import { resetDailyQuota, users } from "./models/user"; // ✅ import users

// Run once when the server starts
resetDailyQuota();

// Check every hour (in case server runs for days)
setInterval(resetDailyQuota, 1000 * 60 * 60);

const app = express();
app.use(cors());
app.use(express.json());

// ✅ All your route mounts
app.use("/auth", authRoutes);
app.use("/search", searchRoutes);
app.use("/subscription", subscriptionRoutes);
app.use("/subscription", subscriptionRequestRoutes);

// ✅ NEW: Debug route (check saved users)
app.get("/debug/users", (req, res) => {
  res.json({ count: users.length, users });
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
