/**
 * Tiny module-level store to hand a freshly created complaint
 * from the submit screen to the list screen without a second network call.
 */
import type { Complaint } from "@/types/complaint";

let pending: Complaint | null = null;

export function setPendingComplaint(c: Complaint) {
  pending = c;
}

export function popPendingComplaint(): Complaint | null {
  const c = pending;
  pending = null;
  return c;
}
