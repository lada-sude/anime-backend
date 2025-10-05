"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const search_1 = __importDefault(require("./routes/search"));
const subscription_1 = __importDefault(require("./routes/subscription"));
const subscriptionRequest_1 = __importDefault(require("./routes/subscriptionRequest")); // ✅ added
const user_1 = require("./models/user");
// Run once when the server starts
(0, user_1.resetDailyQuota)();
// Check every hour (in case server runs for days)
setInterval(user_1.resetDailyQuota, 1000 * 60 * 60);
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ✅ all your route mounts
app.use("/auth", auth_1.default);
app.use("/search", search_1.default);
app.use("/subscription", subscription_1.default);
app.use("/subscription", subscriptionRequest_1.default); // ✅ added
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
//# sourceMappingURL=server.js.map