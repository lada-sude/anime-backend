"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
exports.saveUsers = saveUsers;
exports.createUser = createUser;
exports.resetDailyQuota = resetDailyQuota;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// ✅ Ensure data directory and users.json exist (for Render compatibility)
const dataDir = path_1.default.join(__dirname, "../data");
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
const usersFile = path_1.default.join(dataDir, "users.json");
if (!fs_1.default.existsSync(usersFile)) {
    fs_1.default.writeFileSync(usersFile, "[]", "utf-8");
}
// ✅ Load existing users
exports.users = [];
try {
    const data = fs_1.default.readFileSync(usersFile, "utf-8");
    exports.users = JSON.parse(data);
    console.log(`Loaded ${exports.users.length} users from JSON`);
}
catch (err) {
    console.error("Failed to load users.json:", err);
    exports.users = [];
}
// ✅ Save users to JSON file
function saveUsers() {
    try {
        fs_1.default.writeFileSync(usersFile, JSON.stringify(exports.users, null, 2));
    }
    catch (err) {
        console.error("Failed to save users.json:", err);
    }
}
// ✅ Create a new user
function createUser(username, password) {
    const hashed = bcryptjs_1.default.hashSync(password, 10);
    const user = {
        id: (0, uuid_1.v4)(),
        username,
        password: hashed,
        plan: "free",
        quota: 5, // 5 free searches/day
        lastReset: new Date().toISOString(),
    };
    exports.users.push(user);
    saveUsers();
    return user;
}
// ✅ Reset daily quota (for free users)
function resetDailyQuota() {
    const today = new Date().toDateString();
    exports.users.forEach((u) => {
        const last = new Date(u.lastReset).toDateString();
        if (u.plan === "free" && last !== today) {
            u.quota = 5; // reset to 5 daily
            u.lastReset = new Date().toISOString();
        }
    });
    saveUsers();
}
//# sourceMappingURL=user.js.map