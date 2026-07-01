export type ComplaintStatus = "Pending" | "In Progress" | "Resolved";

export interface PaginatedComplaints {
  data: Complaint[];
  total: number;
  page: number;
  pages: number;
}

export interface ComplaintStats {
  total: number;
  resolved: number;
  pending: number;
  inProgress: number;
}

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

export interface StatusHistoryEntry {
  status: ComplaintStatus;
  note?: string;
  changedAt: string;
  changedBy: string;
}

export interface ComplaintLocation {
  lat: number;
  lng: number;
}

export interface Complaint {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
}
