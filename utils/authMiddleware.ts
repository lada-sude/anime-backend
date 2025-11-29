//utils/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user";

const SECRET = "your-secret-key";

// Shape of JWT payload
interface JwtPayload {
  id: string;
  username: string;
  deviceId?: string;
}

// ---------------------------------------------
// ✅ Verify JWT and attach payload to req.user
// ---------------------------------------------
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const payload = jwt.verify(token, SECRET) as JwtPayload;
    (req as any).user = payload;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// ---------------------------------------------
// ✅ Require Admin Middleware
// Checks database for isAdmin === true
// ---------------------------------------------
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userPayload = (req as any).user as JwtPayload;
    if (!userPayload?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await UserModel.findOne({ id: userPayload.id });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ error: "Admin privileges required" });
    }

    next();
  } catch (err) {
    console.error("Admin check failed:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ---------------------------------------------
// ✅ Sign JWT (still same as before)
// ---------------------------------------------
export const signToken = (id: string, username: string, deviceId: string) => {
  return jwt.sign({ id, username, deviceId }, SECRET, { expiresIn: "30d" });
};
