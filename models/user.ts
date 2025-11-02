// models/user.ts
import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export interface IUser extends Document {
  id: string;
  username: string;
  password: string;
  plan: "free" | "premium";
  quota: number;
  lastReset: string;
  premiumExpires?: string;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  id: { type: String, default: uuidv4 },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  plan: { type: String, enum: ["free", "premium"], default: "free" },
  quota: { type: Number, default: 5 },
  lastReset: { type: String, default: () => new Date().toISOString() },
  premiumExpires: { type: String, default: "" },
});

// ✅ Check password correctness
UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

// ✅ Auto-hash password before saving
UserSchema.pre("save", async function (next) {
  const user = this as IUser;
  if (!user.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});

export const UserModel = mongoose.model<IUser>("User", UserSchema);

// ✅ MongoDB-powered daily quota reset & premium expiry check
export async function resetDailyQuota() {
  try {
    console.log("🧩 Running daily quota check...");

    const users = await UserModel.find();
    const today = new Date().toDateString();

    for (const user of users) {
      const last = new Date(user.lastReset).toDateString();

      // ⏳ Handle expired premium plans
      if (user.plan === "premium" && user.premiumExpires) {
        const expiryDate = new Date(user.premiumExpires);
        if (new Date() > expiryDate) {
          console.log(`⚠️ Premium expired for ${user.username}`);
          user.plan = "free";
          user.quota = 5;
          user.premiumExpires = "";
        }
      }

      // 🔁 Reset quota if it's a new day
      if (last !== today) {
        user.quota = user.plan === "premium" ? 20 : 5;
        user.lastReset = new Date().toISOString();
      }

      await user.save();
    }

    console.log("♻️ Daily quota check completed successfully.");
  } catch (err) {
    console.error("❌ Failed to reset daily quota:", err);
  }
}
