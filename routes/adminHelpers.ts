import { Request, Response, NextFunction } from "express";

// Simple admin check
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  if (user.username === "Admin" || user.role === "admin" || user.isAdmin) return next();
  return res.status(403).json({ error: "Admin only" });
}
