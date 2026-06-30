import type { Response } from "express";
import type { AuthedRequest } from "../middleware/requireRole";
import { UserToken } from "../models/UserToken";
import axios from "axios";

export async function saveToken(req: AuthedRequest, res: Response) {
  const { token } = req.body ?? {};
  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "token is required" });
  }

  await UserToken.findOneAndUpdate(
    { clerkUserId: req.clerkUserId },
    { expoPushToken: token },
    { upsert: true, new: true }
  );

  res.json({ ok: true });
}

export async function sendPushNotification(
  clerkUserId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  const userToken = await UserToken.findOne({ clerkUserId });
  if (!userToken) return;

  await axios.post("https://exp.host/--/api/v2/push/send", {
    to: userToken.expoPushToken,
    title,
    body,
    data,
    sound: "default",
  });
}
