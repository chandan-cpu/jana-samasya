import { useCallback, useRef } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { apiFetch } from "@/lib/api";

export function useApi() {
  const { getToken } = useAuth();

  // Clerk hands back a new `getToken` function on every render, so we stash
  // the latest one in a ref to keep `call`'s identity stable forever.
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const call = useCallback(
    async <T>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> => {
      const token = await getTokenRef.current();
      return apiFetch<T>(path, { ...opts, token });
    },
    []
  );

  return { call };
}
