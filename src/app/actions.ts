"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { isDemoMode } from "@/lib/data";
import type { TransferStatus } from "@/lib/types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Tick (done) or un-tick (pending) a transfer request.
export async function setTransferStatus(
  id: string,
  status: TransferStatus
): Promise<{ ok: boolean; demo?: boolean; error?: string }> {
  if (status !== "pending" && status !== "done") {
    return { ok: false, error: "invalid status" };
  }
  if (isDemoMode()) return { ok: true, demo: true };
  if (!UUID_RE.test(id)) return { ok: false, error: "invalid id" };

  const { error } = await getSupabaseServiceClient()
    .from("transfer_requests")
    .update({
      status,
      completed_at: status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/urgent");
  revalidatePath("/history");
  return { ok: true };
}
