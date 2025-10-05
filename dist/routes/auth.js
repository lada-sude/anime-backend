"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = require("../models/user"); // removed saveUsers
// removed uuidv4 import
const router = express_1.default.Router();
const SECRET = "your-secret-key"; // make sure this matches authMiddleware.ts
// Signup
router.post("/signup", (req, res) => {
    const { username, password } = req.body;
    if (user_1.users.find((u) => u.username === username)) {
        return res.status(400).json({ error: "Username already exists" });
    }
    const user = (0, user_1.createUser)(username, password);
    const token = jsonwebtoken_1.default.sign({ id: user.id, username }, SECRET, { expiresIn: "30d" });
    res.json({ token, plan: user.plan, quota: user.quota });
});
// Login
router.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = user_1.users.find((u) => u.username === username);
    if (!user)
        return res.status(404).json({ error: "User not found" });
    if (!bcryptjs_1.default.compareSync(password, user.password)) {
        return res.status(401).json({ error: "Invalid password" });
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, username }, SECRET, { expiresIn: "30d" });
    res.json({ token, plan: user.plan, quota: user.quota });
});
exports.default = router;
//# sourceMappingURL=auth.js.map