import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { users, createUser } from "../models/user";

const router = express.Router();
const SECRET = "your-secret-key"; // must match authMiddleware.ts

// ✅ Signup
router.post("/signup", (req, res) => {
  const { username, password } = req.body;
  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ error: "Username already exists" });
  }

  const user = createUser(username, password);
  const token = jwt.sign({ id: user.id, username }, SECRET, { expiresIn: "30d" });

  const message = `Welcome, ${username}! Plan: ${user.plan.toUpperCase()}`;
  res.json({ token, plan: user.plan, quota: user.quota, message });
});

// ✅ Login (with persistent plan message)
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const token = jwt.sign({ id: user.id, username }, SECRET, { expiresIn: "30d" });

  const message = `Welcome back, ${username}! Plan: ${user.plan.toUpperCase()}`;
  res.json({ token, plan: user.plan, quota: user.quota, message });
});

export default router;
