// server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth";
import searchRoutes from "./routes/search";
import subscriptionRoutes from "./routes/subscription";
import subscriptionRequestRoutes from "./routes/subscriptionRequest";
import { resetDailyQuota } from "./models/user";

dotenv.config(); // ✅ load environment variables

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Start server only after MongoDB is ready
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ Database connected. Running daily quota reset...");

    // Run once immediately
    await resetDailyQuota();

    // Schedule every hour
    setInterval(resetDailyQuota, 1000 * 60 * 60);

    // ✅ Mount routes
    app.use("/auth", authRoutes);
    app.use("/search", searchRoutes);
    app.use("/subscription", subscriptionRoutes);
    app.use("/subscription", subscriptionRequestRoutes);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
};

startServer();
