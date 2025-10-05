"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../models/user");
const router = express_1.default.Router();
// Admin-only route for upgrading a user's plan
router.post("/upgrade", (req, res) => {
    const { username, extraQuota } = req.body;
    const user = user_1.users.find((u) => u.username === username);
    if (!user)
        return res.status(404).json({ error: "User not found" });
    user.plan = "premium"; // consistent with user.ts
    user.quota += extraQuota || 20; // 1 dollar = 20 searches
    (0, user_1.saveUsers)();
    res.json({ message: `${username} upgraded successfully`, user });
});
exports.default = router;
//# sourceMappingURL=subscription.js.map