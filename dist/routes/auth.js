"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = require("../models/user");
const router = express_1.default.Router();
const SECRET = "your-secret-key"; // must match authMiddleware.ts
// ✅ SIGNUP
router.post("/signup", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({ error: "Username and password required" });
        const existing = await user_1.UserModel.findOne({ username });
        if (existing)
            return res.status(400).json({ error: "Username already exists" });
        const newUser = new user_1.UserModel({ username, password });
        await newUser.save();
        const token = jsonwebtoken_1.default.sign({ id: newUser.id, username }, SECRET, { expiresIn: "30d" });
        const message = `Welcome, ${username}! Plan: ${newUser.plan.toUpperCase()}`;
        res.json({ token, plan: newUser.plan, quota: newUser.quota, message });
    }
    catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ error: "Server error" });
    }
});
// ✅ LOGIN
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await user_1.UserModel.findOne({ username });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ error: "Invalid password" });
        const token = jsonwebtoken_1.default.sign({ id: user.id, username }, SECRET, { expiresIn: "30d" });
        const message = `Welcome back, ${username}! Plan: ${user.plan.toUpperCase()}`;
        res.json({ token, plan: user.plan, quota: user.quota, message });
    }
    catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map