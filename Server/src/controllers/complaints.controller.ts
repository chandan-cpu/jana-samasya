import type { Response } from "express";
import { Complaint, COMPLAINT_CATEGORIES, COMPLAINT_STATUSES } from "../models/Complaint";
import type { AuthedRequest } from "../middleware/requireRole";
import { uploadBufferToCloudinary } from "../config/cloudinary";
import { sendPushNotification } from "./notifications.controller";

export async function createComplaint(req: AuthedRequest, res: Response) {
  const { title, description, category, lat, lng } = req.body ?? {};

  if (!title || !description) {
    return res.status(400).json({ error: "title and description are required" });
  }

  const resolvedCategory = COMPLAINT_CATEGORIES.includes(category) ? category : "Other";

  const files = req.files as { [field: string]: Express.Multer.File[] } | undefined;
  const photoFile = files?.photo?.[0];
  const videoFile = files?.video?.[0];

  const [photoUrl, videoUrl] = await Promise.all([
    photoFile ? uploadBufferToCloudinary(photoFile.buffer, "image") : Promise.resolve(undefined),
    videoFile ? uploadBufferToCloudinary(videoFile.buffer, "video") : Promise.resolve(undefined),
  ]);

  const parsedLat = Number(lat);
  const parsedLng = Number(lng);
  const location =
    Number.isFinite(parsedLat) && Number.isFinite(parsedLng)
      ? { lat: parsedLat, lng: parsedLng }
      : undefined;

  const complaint = await Complaint.create({
    citizenUserId: req.clerkUserId,
    title,
    description,
    category: resolvedCategory,
    status: "Pending",
    photoUrl,
    videoUrl,
    location,
    statusHistory: [
      { status: "Pending", changedAt: new Date(), changedBy: req.clerkUserId },
    ],
  });

  res.status(201).json(complaint);
}

export async function listMyComplaints(req: AuthedRequest, res: Response) {
  const complaints = await Complaint.find({ citizenUserId: req.clerkUserId }).sort({ createdAt: -1 });
  res.json(complaints);
}

export async function listAllComplaints(req: AuthedRequest, res: Response) {
  const { status } = req.query;
  const filter: Record<string, unknown> = {};
  if (typeof status === "string" && COMPLAINT_STATUSES.includes(status as any)) {
    filter.status = status;
  }
  const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
  res.json(complaints);
}

export async function getComplaintById(req: AuthedRequest, res: Response) {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ error: "Complaint not found" });

  if (req.clerkRole === "citizen" && complaint.citizenUserId !== req.clerkUserId) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  res.json(complaint);
}

export async function updateComplaint(req: AuthedRequest, res: Response) {
  const { status, response } = req.body ?? {};

  if (status && !COMPLAINT_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ error: "Complaint not found" });

  if (status) {
    complaint.status = status;
    complaint.statusHistory.push({
      status,
      note: response,
      changedAt: new Date(),
      changedBy: req.clerkUserId!,
    });
  }
  if (typeof response === "string") {
    complaint.mlaResponse = response;
  }

  await complaint.save();

  if (status) {
    sendPushNotification(
      complaint.citizenUserId,
      "Complaint Status Updated",
      `Your complaint "${complaint.title}" is now ${status}.`,
      { complaintId: complaint._id.toString() }
    ).catch(() => {});
  }

  res.json(complaint);
}
