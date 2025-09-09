"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = require("../models/user");
const authMiddleware_1 = require("../utils/authMiddleware");
const uuid_1 = require("uuid");
const router = express_1.default.Router();
// Signup
router.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    if (user_1.users.find(u => u.username === username))
        return res.status(400).json({ error: 'User exists' });
    const hash = await bcryptjs_1.default.hash(password, 10);
    const newUser = { id: (0, uuid_1.v4)(), username, passwordHash: hash, plan: 'free', quota: 100 };
    user_1.users.push(newUser);
    const token = (0, authMiddleware_1.signToken)(newUser.id, newUser.username);
    res.json({ token, plan: newUser.plan, quota: newUser.quota });
});
// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = user_1.users.find(u => u.username === username);
    if (!user)
        return res.status(400).json({ error: 'User not found' });
    const match = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!match)
        return res.status(400).json({ error: 'Wrong password' });
    const token = (0, authMiddleware_1.signToken)(user.id, user.username);
    res.json({ token, plan: user.plan, quota: user.quota });
});
exports.default = router;
//# sourceMappingURL=auth.js.map