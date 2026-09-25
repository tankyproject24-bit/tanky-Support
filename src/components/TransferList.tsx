"use client";

import { useState, useTransition } from "react";
import { setTransferStatus } from "@/app/actions";
import { formatBaht, formatDateTime } from "@/lib/format";
import type { TransferRequestRow } from "@/lib/types";

type Mode = "urgent" | "history";

export function TransferList({
  transfers,
  groupNames,
  mode,
}: {
  transfers: TransferRequestRow[];
  groupNames: Record<string, string>;
  mode: Mode;
}) {
  // Rows already ticked/un-ticked here; hidden until the server list refreshes.
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  // Fresh server data (action revalidate or realtime refresh) supersedes local hiding.
  const [prevTransfers, setPrevTransfers] = useState(transfers);
  if (transfers !== prevTransfers) {
    setPrevTransfers(transfers);
    setHidden(new Set());
  }
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const visible = transfers.filter((t) => !hidden.has(t.id));
  const total = visible.reduce((sum, t) => sum + t.amount, 0);

  function handleToggle(t: TransferRequestRow) {
    const toDone = mode === "urgent";
    const question = toDone
      ? `ยืนยันว่าโอนเงินแล้ว?\n\n${t.account_name}\n${formatBaht(t.amount)}\n\nรายการนี้จะถูกบันทึกไปที่ "ประวัติ"`
      : `ยกเลิกสถานะโอนแล้ว และย้ายกลับไปที่ "เร่งด่วน"?`;
    if (!window.confirm(question)) return;

    setError(null);
    setPendingId(t.id);
    startTransition(async () => {
      const res = await setTransferStatus(t.id, toDone ? "done" : "pending");
      setPendingId(null);
      if (!res.ok) {
        setError(res.error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      setHidden((prev) => new Set(prev).add(t.id));
      setNotice(
        res.demo
          ? "โหมดตัวอย่าง: ยังไม่ได้บันทึกลงฐานข้อมูลจริง"
          : toDone
            ? "บันทึกลงประวัติแล้ว"
            : "ย้ายกลับไปที่เร่งด่วนแล้ว"
      );
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {visible.length > 0 && (
        <div className="flex items-baseline justify-between rounded-xl bg-zinc-100 px-4 py-3 dark:bg-zinc-900">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {visible.length} รายการ
          </span>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            ยอดรวม{" "}
            <span className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {formatBaht(total)}
            </span>
          </span>
        </div>
      )}

      {notice && (
        <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
          ✓ {notice}
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {visible.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          {mode === "urgent" ? "ไม่มีรายการโอนเงินค้างอยู่" : "ยังไม่มีประวัติการโอนเงิน"}
        </div>
      )}

      {visible.map((t) => (
        <div
          key={t.id}
          className={`flex gap-4 rounded-xl border bg-white p-4 shadow-sm dark:bg-zinc-900 ${
            mode === "urgent"
              ? "border-red-200 dark:border-red-900"
              : "border-zinc-200 dark:border-zinc-800"
          }`}
        >
          {mode === "urgent" && (
            <label className="flex shrink-0 cursor-pointer flex-col items-center gap-1 pt-1">
              <input
                type="checkbox"
                className="h-6 w-6 cursor-pointer accent-green-600"
                checked={false}
                disabled={pendingId === t.id}
                onChange={() => handleToggle(t)}
                aria-label={`ทำเครื่องหมายว่าโอนแล้ว: ${t.account_name}`}
              />
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">โอนแล้ว</span>
            </label>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  กลุ่ม {groupNames[t.group_id] ?? t.group_id}
                  {t.requested_by && ` · แจ้งโดย ${t.requested_by}`}
                </p>
                <p className="mt-0.5 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {t.account_name}
                </p>
              </div>
              <p className="text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                {formatBaht(t.amount)}
              </p>
            </div>

            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              <dt className="text-zinc-500 dark:text-zinc-400">ธนาคาร</dt>
              <dd className="text-zinc-800 dark:text-zinc-200">{t.bank_name ?? "-"}</dd>
              <dt className="text-zinc-500 dark:text-zinc-400">เลขบัญชี</dt>
              <dd className="font-mono tracking-wide text-zinc-800 dark:text-zinc-200">
                {t.account_number}
              </dd>
              {t.note && (
                <>
                  <dt className="text-zinc-500 dark:text-zinc-400">หมายเหตุ</dt>
                  <dd className="text-zinc-800 dark:text-zinc-200">{t.note}</dd>
                </>
              )}
            </dl>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400 dark:text-zinc-500">
              <span>
                แจ้งเมื่อ {formatDateTime(t.requested_at)}
                {t.completed_at && ` · โอนแล้วเมื่อ ${formatDateTime(t.completed_at)}`}
              </span>
              {mode === "history" && (
                <button
                  onClick={() => handleToggle(t)}
                  disabled={pendingId === t.id}
                  className="rounded-full border border-zinc-300 px-3 py-1 text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  ยกเลิก
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
