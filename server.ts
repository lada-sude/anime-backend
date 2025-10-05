import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import searchRoutes from "./routes/search";
import subscriptionRoutes from "./routes/subscription";
import subscriptionRequestRoutes from "./routes/subscriptionRequest"; // ✅ added
import { resetDailyQuota } from './models/user';

// Run once when the server starts
resetDailyQuota();

// Check every hour (in case server runs for days)
setInterval(resetDailyQuota, 1000 * 60 * 60);

const app = express();
app.use(cors());
app.use(express.json());

// ✅ all your route mounts
app.use("/auth", authRoutes);
app.use("/search", searchRoutes);
app.use("/subscription", subscriptionRoutes);
app.use("/subscription", subscriptionRequestRoutes); // ✅ added

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);


