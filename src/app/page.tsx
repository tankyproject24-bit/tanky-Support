import Link from "next/link";
import { SummarizeButton } from "@/components/SummarizeButton";
import { Card, DemoBanner, EmptyState, PageHeader, SentimentBadge } from "@/components/ui";
import { getGroupsWithStats, isDemoMode } from "@/lib/data";
import { formatDateTime } from "@/lib/format";

export default async function Home() {
  const demo = isDemoMode();
  const data = await getGroupsWithStats();

  return (
    <>
      <PageHeader
        title="หน้าแรก"
        subtitle="สรุปงานของแต่ละกลุ่ม LINE"
        action={<SummarizeButton />}
      />
      {demo && <DemoBanner />}

      {data.length === 0 && (
        <EmptyState title="ยังไม่มีกลุ่ม LINE เชื่อมต่อ">
          เพิ่มบอทเข้ากลุ่ม LINE แล้วตั้งค่า Webhook URL เป็น{" "}
          <code className="rounded bg-zinc-200 px-1 py-0.5 dark:bg-zinc-800">
            /api/line/webhook
          </code>{" "}
          เพื่อเริ่มเก็บข้อมูล
        </EmptyState>
      )}

      <div className="flex flex-col gap-4">
        {data.map(({ group, latestSummary, messageCount24h }) => (
          <Card key={group.id}>
            <div className="mb-3 flex items-start justify-between gap-3">
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
                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {latestSummary.summary_text}
                </p>

                {latestSummary.topics?.length > 0 && (
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

                <div className="flex items-center justify-between gap-2 text-xs text-zinc-400 dark:text-zinc-500">
                  <span>
                    สรุปเมื่อ {formatDateTime(latestSummary.created_at)} ·{" "}
                    {latestSummary.message_count} ข้อความ
                  </span>
                  <Link
                    href={`/reports/${encodeURIComponent(group.id)}`}
                    className="shrink-0 font-medium text-zinc-600 hover:underline dark:text-zinc-300"
                  >
                    ดูรายงาน →
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                ยังไม่มีสรุป กดปุ่ม &quot;สรุปตอนนี้&quot; เพื่อเริ่ม
              </p>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
