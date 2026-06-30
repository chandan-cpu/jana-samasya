import { useCallback, useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
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

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { complaints, isLoading, error, refresh };
}
