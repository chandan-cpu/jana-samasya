import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { api, ApiError } from "../api";

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

export interface StatusHistoryEntry {
  status: ComplaintStatus;
  note?: string;
  changedAt: string;
  changedBy: string;
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
  location?: { lat: number; lng: number };
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateComplaintInput {
  title: string;
  description: string;
  category: ComplaintCategory;
  lat?: number;
  lng?: number;
  photo?: { uri: string; name: string; type: string };
  video?: { uri: string; name: string; type: string };
}

export interface UpdateComplaintInput {
  id: string;
  status?: ComplaintStatus;
  response?: string;
}

interface ComplaintsState {
  mine: Complaint[];
  all: Complaint[];
  selected: Complaint | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ComplaintsState = {
  mine: [],
  all: [],
  selected: null,
  status: "idle",
  error: null,
};

function toErrorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "Something went wrong";
}

export const fetchMyComplaints = createAsyncThunk(
  "complaints/fetchMine",
  async (_: void, { rejectWithValue }) => {
    try {
      const res = await api.get<Complaint[]>("/api/complaints/mine");
      return res.data;
    } catch (err) {
      return rejectWithValue(toErrorMessage(err));
    }
  }
);

export const fetchAllComplaints = createAsyncThunk(
  "complaints/fetchAll",
  async (status: ComplaintStatus | undefined, { rejectWithValue }) => {
    try {
      const res = await api.get<Complaint[]>("/api/complaints", {
        params: status ? { status } : undefined,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(toErrorMessage(err));
    }
  }
);

export const fetchComplaintById = createAsyncThunk(
  "complaints/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get<Complaint>(`/api/complaints/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(toErrorMessage(err));
    }
  }
);

export const createComplaint = createAsyncThunk(
  "complaints/create",
  async (input: CreateComplaintInput, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("title", input.title);
      form.append("description", input.description);
      form.append("category", input.category);
      if (input.lat !== undefined) form.append("lat", String(input.lat));
      if (input.lng !== undefined) form.append("lng", String(input.lng));
      if (input.photo) form.append("photo", input.photo as unknown as Blob);
      if (input.video) form.append("video", input.video as unknown as Blob);

      const res = await api.post<Complaint>("/api/complaints", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(toErrorMessage(err));
    }
  }
);

export const updateComplaint = createAsyncThunk(
  "complaints/update",
  async ({ id, status, response }: UpdateComplaintInput, { rejectWithValue }) => {
    try {
      const res = await api.patch<Complaint>(`/api/complaints/${id}`, { status, response });
      return res.data;
    } catch (err) {
      return rejectWithValue(toErrorMessage(err));
    }
  }
);

const complaintsSlice = createSlice({
  name: "complaints",
  initialState,
  reducers: {
    clearSelectedComplaint(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyComplaints.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMyComplaints.fulfilled, (state, action: PayloadAction<Complaint[]>) => {
        state.status = "succeeded";
        state.mine = action.payload;
      })
      .addCase(fetchAllComplaints.fulfilled, (state, action: PayloadAction<Complaint[]>) => {
        state.status = "succeeded";
        state.all = action.payload;
      })
      .addCase(fetchComplaintById.fulfilled, (state, action: PayloadAction<Complaint>) => {
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(createComplaint.fulfilled, (state, action: PayloadAction<Complaint>) => {
        state.status = "succeeded";
        state.mine.unshift(action.payload);
      })
      .addCase(updateComplaint.fulfilled, (state, action: PayloadAction<Complaint>) => {
        state.status = "succeeded";
        state.selected = action.payload;
        const idx = state.all.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.all[idx] = action.payload;
      })
      .addMatcher(
        (action): action is ReturnType<typeof fetchMyComplaints.rejected> =>
          action.type.startsWith("complaints/") && action.type.endsWith("/pending"),
        (state) => {
          state.status = "loading";
          state.error = null;
        }
      )
      .addMatcher(
        (action): action is ReturnType<typeof fetchMyComplaints.rejected> =>
          action.type.startsWith("complaints/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.status = "failed";
          state.error = (action.payload as string) ?? "Something went wrong";
        }
      );
  },
});

export const { clearSelectedComplaint } = complaintsSlice.actions;
export default complaintsSlice.reducer;
