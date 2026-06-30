import multer from "multer";

export const uploadComplaintMedia = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
}).fields([
  { name: "photo", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);
