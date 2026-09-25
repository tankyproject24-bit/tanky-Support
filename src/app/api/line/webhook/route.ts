import { NextRequest, NextResponse } from "next/server";
import {
  verifyLineSignature,
  getGroupMemberDisplayName,
  getGroupSummary,
  type LineWebhookEvent,
} from "@/lib/line";
import { getSupabaseServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!channelSecret || !channelAccessToken) {
    return NextResponse.json(
      { error: "LINE credentials not configured" },
      { status: 500 }
    );
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-line-signature");
  if (!verifyLineSignature(rawBody, signature, channelSecret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody) as { events?: LineWebhookEvent[] };
  const events = body.events ?? [];

  const groupEvents = events.filter(
    (e) => e.type === "message" && e.source?.type === "group" && e.source.groupId
  );

  if (groupEvents.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const supabase = getSupabaseServiceClient();

  const seenGroups = new Set<string>();
  for (const event of groupEvents) {
    const groupId = event.source!.groupId!;
    if (!seenGroups.has(groupId)) {
      seenGroups.add(groupId);
      const { data: existing } = await supabase
        .from("groups")
        .select("id")
        .eq("id", groupId)
        .maybeSingle();
      if (!existing) {
        const summary = await getGroupSummary(groupId, channelAccessToken);
        await supabase
          .from("groups")
          .insert({ id: groupId, name: summary?.groupName ?? "Unnamed group" });
      }
    }
  }

  const rows = await Promise.all(
    groupEvents.map(async (event) => {
      const groupId = event.source!.groupId!;
      const userId = event.source!.userId ?? null;
      const displayName = userId
        ? await getGroupMemberDisplayName(groupId, userId, channelAccessToken)
        : null;

      return {
        group_id: groupId,
        line_user_id: userId,
        display_name: displayName,
        message_type: event.message?.type ?? "unknown",
        message_text: event.message?.type === "text" ? event.message.text ?? null : null,
        raw_event: event,
        sent_at: new Date(event.timestamp).toISOString(),
      };
    })
  );

  const { error } = await supabase.from("messages").insert(rows);
  if (error) {
    console.error("Failed to insert messages", error);
    return NextResponse.json({ error: "insert failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// LINE sends a GET during webhook verification in some setups; respond 200.
export async function GET() {
  return NextResponse.json({ ok: true });
}
