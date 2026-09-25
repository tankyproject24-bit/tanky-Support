import { TransferList } from "@/components/TransferList";
import { DemoBanner, PageHeader } from "@/components/ui";
import { getGroupNameMap, getTransfers, isDemoMode } from "@/lib/data";

export default async function HistoryPage() {
  const demo = isDemoMode();
  const [transfers, groupNames] = await Promise.all([getTransfers("done"), getGroupNameMap()]);

  return (
    <>
      <PageHeader title="ประวัติ" subtitle="รายการโอนเงินที่ยืนยันแล้วจากเมนูเร่งด่วน" />
      {demo && <DemoBanner />}
      <TransferList transfers={transfers} groupNames={groupNames} mode="history" />
    </>
  );
}
