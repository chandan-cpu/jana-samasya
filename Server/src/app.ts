import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import complaintsRouter from "./routes/complaints";
import adminRouter from "./routes/admin";
import notificationsRouter from "./routes/notifications";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(clerkMiddleware());

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/complaints", complaintsRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/notifications", notificationsRouter);

  app.use(errorHandler);

  return app;
}
