import express from "express";
import { verifyToken } from "../utils/authMiddleware";
import fs from "fs";
import path from "path";
import { UserModel } from "../models/user";

const router = express.Router();

// Path to store subscription requests
const REQUESTS_FILE = path.join(__dirname, "../data/subscription_requests.json");

// Load existing requests
const loadRequests = () => {
  try {
    if (fs.existsSync(REQUESTS_FILE)) {
      return JSON.parse(fs.readFileSync(REQUESTS_FILE, "utf8"));
    }
  } catch (err) {
    console.error("Error reading requests file:", err);
  }
  return [];
};

// Save requests
const saveRequests = (data: any) => {
  try {
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing requests file:", err);
  }
};

// 📥 User submits payment confirmation
router.post("/request", verifyToken, async (req, res) => {
  const { fullName, accountNumber, amount, note } = req.body;
  const username = (req as any).user.username;

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
router.post("/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const requests = loadRequests();
    const request = requests.find((r: any) => r.id === id);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    const user = await UserModel.findOne({ username: request.username });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 💰 Add 20 searches per ₦1000
    const amountNum = parseInt(request.amount.replace(/\D/g, ""), 10);
    const addedQuota = Math.floor(amountNum / 1000) * 20;
    user.quota += addedQuota;
    await user.save();

    request.status = "approved";
    saveRequests(requests);

    res.json({
      message: `Approved ${request.username} (+${addedQuota} searches)`,
      user,
    });
  } catch (err) {
    console.error("Approve request error:", err);
    res.status(500).json({ error: "Failed to approve request" });
  }
});

export default router;
