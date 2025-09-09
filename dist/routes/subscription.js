"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../utils/authMiddleware");
const user_1 = require("../models/user");
const router = express_1.default.Router();
// Simulate subscription purchase
router.post('/buy', authMiddleware_1.verifyToken, (req, res) => {
    const userId = req.user.id;
    const user = user_1.users.find(u => u.id === userId);
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    // Upgrade plan
    user.plan = 'paid';
    user.quota = 1000; // shared paid plan
    res.json({ plan: user.plan, quota: user.quota });
});
exports.default = router;
//# sourceMappingURL=subscription.js.map