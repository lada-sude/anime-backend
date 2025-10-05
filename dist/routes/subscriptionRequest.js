"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../utils/authMiddleware");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
// Path to store subscription requests
const REQUESTS_FILE = path_1.default.join(__dirname, "../data/subscription_requests.json");
// Load existing requests
const loadRequests = () => {
    try {
        if (fs_1.default.existsSync(REQUESTS_FILE)) {
            return JSON.parse(fs_1.default.readFileSync(REQUESTS_FILE, "utf8"));
        }
    }
    catch (err) {
        console.error("Error reading requests file:", err);
    }
    return [];
};
// Save requests
const saveRequests = (data) => {
    try {
        fs_1.default.writeFileSync(REQUESTS_FILE, JSON.stringify(data, null, 2));
    }
    catch (err) {
        console.error("Error writing requests file:", err);
    }
};
// 📥 User submits a payment confirmation
router.post("/request", authMiddleware_1.verifyToken, (req, res) => {
    const { fullName, accountNumber, amount, note } = req.body;
    const username = req.user.username;
    if (!fullName || !accountNumber || !amount) {
        return res.status(400).json({ error: "Please fill all required fields" });
    }
    const requests = loadRequests();
    const newRequest = {
        id: Date.now().toString(),
        username,
        fullName,
        accountNumber,
        amount,
        note: note || "",
        status: "pending",
        createdAt: new Date().toISOString(),
    };
    requests.push(newRequest);
    saveRequests(requests);
    res.json({ message: "Subscription request submitted!", request: newRequest });
});
// 👑 Admin: view all requests
router.get("/requests", (req, res) => {
    const requests = loadRequests();
    res.json(requests);
});
// 👑 Admin: approve a request (adds searches)
const user_1 = require("../models/user");
router.post("/approve/:id", (req, res) => {
    const { id } = req.params;
    const requests = loadRequests();
    const request = requests.find((r) => r.id === id);
    if (!request) {
        return res.status(404).json({ error: "Request not found" });
    }
    const user = user_1.users.find((u) => u.username === request.username);
    if (!user)
        return res.status(404).json({ error: "User not found" });
    // 💰 Add 20 searches per ₦1000
    const amountNum = parseInt(request.amount.replace(/\D/g, ""), 10);
    const addedQuota = Math.floor(amountNum / 1000) * 20;
    user.quota += addedQuota;
    request.status = "approved";
    saveRequests(requests);
    res.json({
        message: `Approved ${request.username} (+${addedQuota} searches)`,
        user,
    });
});
exports.default = router;
//# sourceMappingURL=subscriptionRequest.js.map