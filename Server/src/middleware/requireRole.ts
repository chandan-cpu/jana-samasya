import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import type { Role } from "../types/clerk";

export interface AuthedRequest extends Request {
  clerkUserId?: string;
  clerkRole?: Role;
}

export function requireRole(...allowed: Role[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const { isAuthenticated, userId, sessionClaims } = getAuth(req);

    if (!isAuthenticated || !userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const role: Role = sessionClaims?.metadata?.role ?? "citizen";

    if (!allowed.includes(role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }

    req.clerkUserId = userId;
    req.clerkRole = role;
    next();
  };
}
