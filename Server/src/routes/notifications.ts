import { Router } from "express";
import { requireRole } from "../middleware/requireRole";
import { saveToken } from "../controllers/notifications.controller";

const router = Router();

router.post("/token", requireRole("citizen", "mla"), saveToken);

export default router;
