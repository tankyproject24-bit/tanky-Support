import { getSupabaseServiceClient } from "@/lib/supabase";
import {
  demoGroups,
  demoMessageCount24h,
  getDemoImportantMessages,
  getDemoSummaries,
  getDemoTransfers,
} from "@/lib/demo-data";
import type {
  GroupRow,
  ImportantMessageRow,
  SummaryRow,
  TransferRequestRow,
  TransferStatus,
} from "@/lib/types";

// Server-side data loaders. Fall back to demo data when Supabase isn't configured.

export function isDemoMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export type GroupWithStats = {
  group: GroupRow;
  latestSummary: SummaryRow | null;
  messageCount24h: number;
};

export async function getGroups(): Promise<GroupRow[]> {
  if (isDemoMode()) return demoGroups;

  const { data, error } = await getSupabaseServiceClient()
    .from("groups")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getGroup(groupId: string): Promise<GroupRow | null> {
  if (isDemoMode()) return demoGroups.find((g) => g.id === groupId) ?? null;

  const { data, error } = await getSupabaseServiceClient()
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getGroupsWithStats(): Promise<GroupWithStats[]> {
  if (isDemoMode()) {
    const summaries = getDemoSummaries();
    return demoGroups.map((group) => ({
      group,
      latestSummary: summaries.find((s) => s.group_id === group.id) ?? null,
      messageCount24h: demoMessageCount24h[group.id] ?? 0,
    }));
  }

  const supabase = getSupabaseServiceClient();
  const groups = await getGroups();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  return Promise.all(
    groups.map(async (group) => {
      const [{ data: summaries }, { count }] = await Promise.all([
        supabase
          .from("summaries")
          .select("*")
          .eq("group_id", group.id)
          .order("created_at", { ascending: false })
          .limit(1),
        supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("group_id", group.id)
          .gte("sent_at", since),
      ]);

      return {
        group,
        latestSummary: summaries?.[0] ?? null,
        messageCount24h: count ?? 0,
      };
    })
  );
}

export async function getGroupSummaries(groupId: string, limit = 10): Promise<SummaryRow[]> {
  if (isDemoMode()) return getDemoSummaries().filter((s) => s.group_id === groupId);

  const { data, error } = await getSupabaseServiceClient()
    .from("summaries")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getImportantMessages(groupId: string): Promise<ImportantMessageRow[]> {
  if (isDemoMode()) {
    return getDemoImportantMessages()
      .filter((m) => m.group_id === groupId)
      .sort((a, b) => b.sent_at.localeCompare(a.sent_at));
  }

  const { data, error } = await getSupabaseServiceClient()
    .from("important_messages")
    .select("*")
    .eq("group_id", groupId)
    .order("sent_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getImportantMessageCounts(): Promise<Record<string, number>> {
  const rows = isDemoMode()
    ? getDemoImportantMessages()
    : ((
        await getSupabaseServiceClient().from("important_messages").select("group_id")
      ).data ?? []);

  const counts: Record<string, number> = {};
  for (const r of rows as { group_id: string }[]) {
    counts[r.group_id] = (counts[r.group_id] ?? 0) + 1;
  }
  return counts;
}

export async function getTransfers(status: TransferStatus): Promise<TransferRequestRow[]> {
  if (isDemoMode()) {
    return getDemoTransfers()
      .filter((t) => t.status === status)
      .sort((a, b) =>
        status === "done"
          ? (b.completed_at ?? "").localeCompare(a.completed_at ?? "")
          : a.requested_at.localeCompare(b.requested_at)
      );
  }

  const { data, error } = await getSupabaseServiceClient()
    .from("transfer_requests")
    .select("*")
    .eq("status", status)
    .order(status === "done" ? "completed_at" : "requested_at", {
      ascending: status !== "done",
    })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []).map((t: TransferRequestRow) => ({ ...t, amount: Number(t.amount) }));
}

export async function getGroupNameMap(): Promise<Record<string, string>> {
  const groups = await getGroups();
  return Object.fromEntries(groups.map((g) => [g.id, g.name]));
}
