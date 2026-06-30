import type { Request, Response } from "express";
import { clerkClient } from "@clerk/express";
import { env } from "../config/env";

export async function grantMlaRole(req: Request, res: Response) {
  const secret = req.header("x-admin-secret");
  if (secret !== env.adminSetupSecret) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { clerkUserId } = req.body ?? {};
  if (!clerkUserId) {
    return res.status(400).json({ error: "clerkUserId is required" });
  }

  await clerkClient.users.updateUserMetadata(clerkUserId, {
    publicMetadata: { role: "mla" },
  });

  res.json({ ok: true });
}
