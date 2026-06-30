import { Router } from "express";
import { grantMlaRole } from "../controllers/admin.controller";

const router = Router();

router.post("/grant-mla-role", grantMlaRole);

export default router;
