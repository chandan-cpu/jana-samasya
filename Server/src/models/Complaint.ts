import { Schema, model, Types } from "mongoose";

export type ComplaintStatus = "Pending" | "In Progress" | "Resolved";
export type ComplaintCategory =
  | "Roads"
  | "Water Supply"
  | "Electricity"
  | "Sanitation"
  | "Public Safety"
  | "Other"
  | "ৰাস্তা"
  | "পানী যোগান"
  | "বিদ্যুৎ"
  | "পৰিষ্কাৰ-পৰিচ্ছন্নতা"
  | "জনসুৰক্ষা"
  | "অন্যান্য";

export const COMPLAINT_STATUSES: ComplaintStatus[] = ["Pending", "In Progress", "Resolved"];
export const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  "Roads",
  "Water Supply",
  "Electricity",
  "Sanitation",
  "Public Safety",
  "Other",
  "ৰাস্তা",
  "পানী যোগান",
  "বিদ্যুৎ",
  "পৰিষ্কাৰ-পৰিচ্ছন্নতা",
  "জনসুৰক্ষা",
  "অন্যান্য"
];

export interface StatusHistoryEntry {
  status: ComplaintStatus;
  note?: string;
  changedAt: Date;
  changedBy: string;
}

export interface ComplaintLocation {
  lat: number;
  lng: number;
}

export interface ComplaintDoc {
  _id: Types.ObjectId;
  citizenUserId: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  mlaResponse?: string;
  photoUrl?: string;
  videoUrl?: string;
  location?: ComplaintLocation;
  statusHistory: StatusHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const statusHistorySchema = new Schema<StatusHistoryEntry>(
  {
    status: { type: String, enum: COMPLAINT_STATUSES, required: true },
    note: { type: String },
    changedAt: { type: Date, default: () => new Date() },
    changedBy: { type: String, required: true },
  },
  { _id: false }
);

const locationSchema = new Schema<ComplaintLocation>(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const complaintSchema = new Schema<ComplaintDoc>(
  {
    citizenUserId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    category: { type: String, enum: COMPLAINT_CATEGORIES, default: "Other" },
    status: { type: String, enum: COMPLAINT_STATUSES, default: "Pending", index: true },
    mlaResponse: { type: String, maxlength: 3000 },
    photoUrl: { type: String },
    videoUrl: { type: String },
    location: { type: locationSchema },
    statusHistory: { type: [statusHistorySchema], default: [] },
  },
  { timestamps: true }
);

export const Complaint = model<ComplaintDoc>("Complaint", complaintSchema);
