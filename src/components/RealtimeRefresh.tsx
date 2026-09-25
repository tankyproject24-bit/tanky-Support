"use client";

import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Status = "off" | "connecting" | "live" | "error";

const REFRESH_DEBOUNCE_MS = 800;

// Listens for the "dashboard" broadcast sent by the DB triggers in supabase/schema.sql
// and re-renders the current page with fresh server data. Renders a small status dot.
export function RealtimeRefresh() {
  const router = useRouter();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const [status, setStatus] = useState<Status>(url && anonKey ? "connecting" : "off");

  useEffect(() => {
    if (!url || !anonKey) return;

    const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
    let timer: ReturnType<typeof setTimeout> | undefined;

    const channel = supabase
      .channel("dashboard")
      .on("broadcast", { event: "change" }, () => {
        // Chat messages can arrive in bursts; coalesce them into one refresh.
        clearTimeout(timer);
        timer = setTimeout(() => router.refresh(), REFRESH_DEBOUNCE_MS);
      })
      .subscribe((s) => {
        if (s === "SUBSCRIBED") setStatus("live");
        else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") setStatus("error");
        else if (s === "CLOSED") setStatus("connecting");
      });

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [url, anonKey, router]);

  if (status === "off") return null;

  const label = { live: "สด", connecting: "กำลังเชื่อมต่อ", error: "ออฟไลน์" }[status];
  const dot = {
    live: "bg-green-500",
    connecting: "bg-amber-400",
    error: "bg-red-500",
  }[status];

  return (
    <span
      className="flex shrink-0 items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400"
      title="อัปเดตข้อมูลแบบเรียลไทม์"
    >
      <span className="relative flex h-2 w-2">
        {status === "live" && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${dot}`} />
      </span>
      {label}
    </span>
  );
}
