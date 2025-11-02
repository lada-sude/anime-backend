"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        console.log("🧩 Connecting to MongoDB URI:", uri.substring(0, 40) + "...");
        await mongoose_1.default.connect(uri, {
            serverSelectionTimeoutMS: 10000, // 10s timeout
        });
        console.log("✅ MongoDB Connected Successfully");
    }
    catch (err) {
        console.error("❌ MongoDB Connection Failed:", err);
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=db.js.map