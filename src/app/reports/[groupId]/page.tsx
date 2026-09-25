import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, DemoBanner, EmptyState, PageHeader, SentimentBadge } from "@/components/ui";
import { getGroup, getGroupSummaries, getImportantMessages, isDemoMode } from "@/lib/data";
import { formatDateTime } from "@/lib/format";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId: rawId } = await params;
  const groupId = decodeURIComponent(rawId);
  const demo = isDemoMode();

  const group = await getGroup(groupId);
  if (!group) notFound();

  const [importantMessages, summaries] = await Promise.all([
    getImportantMessages(groupId),
    getGroupSummaries(groupId),
  ]);

  return (
    <>
      <Link
        href="/reports"
        className="mb-3 inline-block text-sm text-zinc-500 hover:underline dark:text-zinc-400"
      >
        ← กลับไปรายงาน
      </Link>
      <PageHeader title={group.name} subtitle="รายละเอียดรายงานของกลุ่ม" />
      {demo && <DemoBanner />}

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          ข้อความสำคัญ
        </h2>
        {importantMessages.length === 0 ? (
          <EmptyState title="ยังไม่มีข้อความสำคัญ">
            เมื่อบอท AI อ่านแชทในกลุ่มแล้วพบข้อความสำคัญ จะแสดงที่นี่
          </EmptyState>
        ) : (
          <ol className="flex flex-col gap-2">
            {importantMessages.map((m) => (
              <li
                key={m.id}
                className="rounded-xl border-l-4 border-violet-400 bg-white p-4 shadow-sm dark:border-violet-600 dark:bg-zinc-900"
              >
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {m.display_name ?? "ไม่ทราบชื่อ"}
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {formatDateTime(m.sent_at)}
                  </span>
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">{m.message_text}</p>
                {m.reason && (
                  <p className="mt-2 inline-block rounded-full bg-violet-50 px-2 py-0.5 text-xs text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                    {m.reason}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          ประวัติการสรุป
        </h2>
        {summaries.length === 0 ? (
          <EmptyState title="ยังไม่มีสรุป" />
        ) : (
          <div className="flex flex-col gap-3">
            {summaries.map((s) => (
              <Card key={s.id}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDateTime(s.period_start)} – {formatDateTime(s.period_end)} ·{" "}
                    {s.message_count} ข้อความ
                  </span>
                  <SentimentBadge sentiment={s.sentiment} />
                </div>
                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {s.summary_text}
                </p>
                {s.action_items?.length > 0 && (
                  <ul className="mt-2 list-inside list-disc text-sm text-zinc-600 dark:text-zinc-400">
                    {s.action_items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
