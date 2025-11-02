"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const auth_1 = __importDefault(require("./routes/auth"));
const search_1 = __importDefault(require("./routes/search"));
const subscription_1 = __importDefault(require("./routes/subscription"));
const subscriptionRequest_1 = __importDefault(require("./routes/subscriptionRequest"));
const user_1 = require("./models/user");
dotenv_1.default.config(); // ✅ load environment variables
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ✅ Start server only after MongoDB is ready
const startServer = async () => {
    try {
        await (0, db_1.connectDB)();
        console.log("✅ Database connected. Running daily quota reset...");
        // Run once immediately
        await (0, user_1.resetDailyQuota)();
        // Schedule every hour
        setInterval(user_1.resetDailyQuota, 1000 * 60 * 60);
        // ✅ Mount routes
        app.use("/auth", auth_1.default);
        app.use("/search", search_1.default);
        app.use("/subscription", subscription_1.default);
        app.use("/subscription", subscriptionRequest_1.default);
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    }
    catch (err) {
        console.error("❌ Failed to start server:", err);
    }
};
startServer();
//# sourceMappingURL=server.js.map