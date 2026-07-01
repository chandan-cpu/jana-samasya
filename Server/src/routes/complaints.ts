import { Router } from "express";
import { requireRole } from "../middleware/requireRole";
import { uploadComplaintMedia } from "../middleware/upload";
import {
  createComplaint,
  getComplaintById,
  getComplaintStats,
  listAllComplaints,
  listMyComplaints,
  updateComplaint,
} from "../controllers/complaints.controller";

const router = Router();

router.post("/", requireRole("citizen"), uploadComplaintMedia, createComplaint);
router.get("/mine", requireRole("citizen"), listMyComplaints);
router.get("/stats", requireRole("mla"), getComplaintStats);
router.get("/", requireRole("mla"), listAllComplaints);
router.get("/:id", requireRole("citizen", "mla"), getComplaintById);
router.patch("/:id", requireRole("mla"), updateComplaint);

export default router;
