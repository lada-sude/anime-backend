// authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET = "your-secret-key";

// ✅ Middleware to verify user token
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const payload = jwt.verify(token, SECRET) as {
      id: string;
      username: string;
      deviceId?: string;
    };

    (req as any).user = payload; // attach to request
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// ✅ Function to sign a JWT including deviceId
export const signToken = (id: string, username: string, deviceId: string) => {
  return jwt.sign({ id, username, deviceId }, SECRET, { expiresIn: "30d" });
};
