import Link from "next/link";
import { DemoBanner, EmptyState, PageHeader } from "@/components/ui";
import { getGroupsWithStats, getImportantMessageCounts, isDemoMode } from "@/lib/data";
import { formatDateTime } from "@/lib/format";

export default async function ReportsPage() {
  const demo = isDemoMode();
  const [groups, importantCounts] = await Promise.all([
    getGroupsWithStats(),
    getImportantMessageCounts(),
  ]);

  return (
    <>
      <PageHeader title="รายงาน" subtitle="เลือกกลุ่ม LINE เพื่อดูข้อความสำคัญที่ AI สรุปไว้" />
      {demo && <DemoBanner />}

      {groups.length === 0 && <EmptyState title="ยังไม่มีกลุ่ม LINE เชื่อมต่อ" />}

      <ul className="flex flex-col gap-3">
        {groups.map(({ group, latestSummary, messageCount24h }) => (
          <li key={group.id}>
            <Link
              href={`/reports/${encodeURIComponent(group.id)}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
            >
              <div className="min-w-0">
                <p className="font-semibold text-zinc-900 dark:text-zinc-50">{group.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {messageCount24h} ข้อความใน 24 ชม.
                  {latestSummary && ` · สรุปล่าสุด ${formatDateTime(latestSummary.created_at)}`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                  ข้อความสำคัญ {importantCounts[group.id] ?? 0}
                </span>
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">ดู →</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
