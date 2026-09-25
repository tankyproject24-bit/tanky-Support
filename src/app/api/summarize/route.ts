import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { summarizeConversation } from "@/lib/anthropic";
import type { MessageRow, GroupRow } from "@/lib/types";

// Triggers a summary for one group (or all groups) over a time window.
// POST body: { groupId?: string, hours?: number }
// If groupId is omitted, summarizes every group that has new messages.
export async function POST(req: NextRequest) {
  const cronSecret = process.env.SUMMARIZE_CRON_SECRET;
  if (cronSecret) {
    const provided = req.headers.get("x-cron-secret");
    if (provided !== cronSecret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const body = (await req.json().catch(() => ({}))) as {
    groupId?: string;
    hours?: number;
  };
  const hours = body.hours ?? 24;
  const periodStart = new Date(Date.now() - hours * 60 * 60 * 1000);
  const periodEnd = new Date();

  const supabase = getSupabaseServiceClient();

  let groups: GroupRow[];
  if (body.groupId) {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .eq("id", body.groupId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    groups = data ?? [];
  } else {
    const { data, error } = await supabase.from("groups").select("*");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    groups = data ?? [];
  }

  const results: { groupId: string; status: string }[] = [];

  for (const group of groups) {
    const { data: messages, error: msgError } = await supabase
      .from("messages")
      .select("*")
      .eq("group_id", group.id)
      .gte("sent_at", periodStart.toISOString())
      .lte("sent_at", periodEnd.toISOString())
      .order("sent_at", { ascending: true });

    if (msgError) {
      results.push({ groupId: group.id, status: `error: ${msgError.message}` });
      continue;
    }

    const textMessages = (messages ?? []).filter(
      (m: MessageRow) => m.message_text && m.message_text.trim().length > 0
    );

    if (textMessages.length === 0) {
      results.push({ groupId: group.id, status: "skipped: no messages" });
      continue;
    }

    const transcript = textMessages
      .map((m: MessageRow) => {
        const time = new Date(m.sent_at).toLocaleString("th-TH");
        const who = m.display_name ?? "ไม่ทราบชื่อ";
        return `[${time}] ${who}: ${m.message_text}`;
      })
      .join("\n");

    try {
      const summary = await summarizeConversation(transcript, group.name);
      const { error: insertError } = await supabase.from("summaries").insert({
        group_id: group.id,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        summary_text: summary.summary_text,
        topics: summary.topics,
        action_items: summary.action_items,
        sentiment: summary.sentiment,
        message_count: textMessages.length,
      });
      if (insertError) {
        results.push({ groupId: group.id, status: `error: ${insertError.message}` });
      } else {
        results.push({ groupId: group.id, status: "summarized" });
      }
    } catch (err) {
      results.push({
        groupId: group.id,
        status: `error: ${err instanceof Error ? err.message : "unknown"}`,
      });
    }
  }

  return NextResponse.json({ results });
}
