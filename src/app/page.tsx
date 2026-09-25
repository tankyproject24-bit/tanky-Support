import { getSupabaseServiceClient } from "@/lib/supabase";
import type { GroupRow, SummaryRow } from "@/lib/types";
import { SummarizeButton } from "@/components/SummarizeButton";
import { getDemoDashboardData } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

type GroupWithStats = {
  group: GroupRow;
  latestSummary: SummaryRow | null;
  messageCount24h: number;
};

async function loadDashboardData(): Promise<GroupWithStats[]> {
  const supabase = getSupabaseServiceClient();

  const { data: groups, error: groupsError } = await supabase
    .from("groups")
    .select("*")
    .order("name", { ascending: true });

  if (groupsError || !groups) return [];

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const results = await Promise.all(
    groups.map(async (group: GroupRow) => {
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

  return results;
}

function SentimentBadge({ sentiment }: { sentiment: string | null }) {
  if (!sentiment) return null;
  const colors: Record<string, string> = {
    positive: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    negative: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    neutral: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    mixed: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  };
  const cls = colors[sentiment.toLowerCase()] ?? colors.neutral;
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {sentiment}
    </span>
  );
}

export default async function Home() {
  const isDemo =
    !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY;
  const data = isDemo ? getDemoDashboardData() : await loadDashboardData();

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              LINE Group Insights
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              สรุปบทสนทนากลุ่ม LINE ด้วย AI
            </p>
          </div>
          <SummarizeButton />
        </header>

        {isDemo && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            โหมดตัวอย่าง — ข้อมูลด้านล่างเป็นข้อมูลจำลอง จะแสดงข้อมูลจริงเมื่อตั้งค่า Supabase แล้ว
          </div>
        )}

        {data.length === 0 && (
          <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            <p className="font-medium">ยังไม่มีกลุ่ม LINE เชื่อมต่อ</p>
            <p className="mt-1 text-sm">
              เพิ่มบอทเข้ากลุ่ม LINE แล้วตั้งค่า Webhook URL เป็น{" "}
              <code className="rounded bg-zinc-200 px-1 py-0.5 dark:bg-zinc-800">
                /api/line/webhook
              </code>{" "}
              เพื่อเริ่มเก็บข้อมูล
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {data.map(({ group, latestSummary, messageCount24h }) => (
            <div
              key={group.id}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {group.name}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {messageCount24h} ข้อความใน 24 ชม.ที่ผ่านมา
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <SentimentBadge sentiment={latestSummary?.sentiment ?? null} />
                  <SummarizeButton groupId={group.id} />
                </div>
              </div>

              {latestSummary ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    {latestSummary.summary_text}
                  </p>

                  {latestSummary.topics?.length > 0 && (
                    <div>
                      <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        หัวข้อ
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {latestSummary.topics.map((topic, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {latestSummary.action_items?.length > 0 && (
                    <div>
                      <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        สิ่งที่ต้องทำ
                      </p>
                      <ul className="list-inside list-disc text-sm text-zinc-700 dark:text-zinc-300">
                        {latestSummary.action_items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    สรุปเมื่อ {new Date(latestSummary.created_at).toLocaleString("th-TH")}{" "}
                    · {latestSummary.message_count} ข้อความ
                  </p>
                </div>
              ) : (
                <p className="text-sm text-zinc-400 dark:text-zinc-500">
                  ยังไม่มีสรุป กดปุ่ม &quot;สรุปตอนนี้&quot; เพื่อเริ่ม
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
