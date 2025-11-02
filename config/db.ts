import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI!;
    console.log("🧩 Connecting to MongoDB URI:", uri.substring(0, 40) + "...");

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10s timeout
    });

    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err);
  }
};
