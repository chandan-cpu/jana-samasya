import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useApi } from "@/hooks/useApi";
import { popPendingComplaint } from "@/lib/newComplaintStore";
import type { Complaint } from "@/types/complaint";

export function useMyComplaints() {
  const { call } = useApi();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await call<Complaint[]>("/api/complaints/mine");
      setComplaints(data);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load complaints.");
    } finally {
      setIsLoading(false);
    }
  }, [call]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Re-fetch once every time this screen gains focus.
  // If a complaint was just submitted, prepend it instantly first
  // so there's no visible delay — the refresh then confirms server state.
  useFocusEffect(
    useCallback(() => {
      const fresh = popPendingComplaint();
      if (fresh) {
        // Optimistic prepend — shows immediately, no spinner
        setComplaints((prev) => {
          const alreadyExists = prev.some((c) => c._id === fresh._id);
          return alreadyExists ? prev : [fresh, ...prev];
        });
      }
      // One background API call to confirm/sync server state
      refresh();
    }, [refresh])
  );

  return { complaints, isLoading, error, refresh };
}
