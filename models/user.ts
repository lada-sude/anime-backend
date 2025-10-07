import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export type User = {
  id: string;
  username: string;
  password: string; // hashed
  plan: "free" | "premium";
  quota: number;
  lastReset: string; // always a string, never undefined
};

// ✅ Use project root (Render-safe)
const dataDir = path.join(process.cwd(), "data");
const backupFile = path.join(process.cwd(), "users-backup.json");

// ✅ Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const usersFile = path.join(dataDir, "users.json");

// ✅ If main users.json is missing but a backup exists, restore it
if (!fs.existsSync(usersFile) && fs.existsSync(backupFile)) {
  fs.copyFileSync(backupFile, usersFile);
  console.log("📦 Backup restored successfully from users-backup.json");
}

// ✅ Load existing users
export let users: User[] = [];
try {
  const data = fs.existsSync(usersFile) ? fs.readFileSync(usersFile, "utf-8") : "[]";
  users = JSON.parse(data);
  console.log(`✅ Loaded ${users.length} users from JSON`);
} catch (err) {
  console.error("❌ Failed to load users.json:", err);
  users = [];
}

// ✅ Save users to JSON file and backup file
export function saveUsers() {
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    fs.writeFileSync(backupFile, JSON.stringify(users, null, 2));
    console.log("💾 Users saved and backed up.");
  } catch (err) {
    console.error("❌ Failed to save users.json:", err);
  }
}

// ✅ Create a new user
export function createUser(username: string, password: string): User {
  const hashed = bcrypt.hashSync(password, 10);
  const user: User = {
    id: uuidv4(),
    username,
    password: hashed,
    plan: "free",
    quota: 5, // 5 free searches/day
    lastReset: new Date().toISOString(),
  };
  users.push(user);
  saveUsers();
  return user;
}

// ✅ Reset daily quota (for free users)
export function resetDailyQuota() {
  const today = new Date().toDateString();

  users.forEach((u) => {
    const last = new Date(u.lastReset).toDateString();
    if (u.plan === "free" && last !== today) {
      u.quota = 5; // reset to 5 daily
      u.lastReset = new Date().toISOString();
    }
  });

  saveUsers();
}
