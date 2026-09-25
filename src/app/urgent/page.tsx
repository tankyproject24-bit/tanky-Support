import { TransferList } from "@/components/TransferList";
import { DemoBanner, PageHeader } from "@/components/ui";
import { getGroupNameMap, getTransfers, isDemoMode } from "@/lib/data";

export default async function UrgentPage() {
  const demo = isDemoMode();
  const [transfers, groupNames] = await Promise.all([
    getTransfers("pending"),
    getGroupNameMap(),
  ]);

  return (
    <>
      <PageHeader
        title="เร่งด่วน"
        subtitle="รายการแจ้งโอนเงินจากกลุ่ม LINE — ติ๊กเมื่อโอนแล้ว ระบบจะบันทึกลงประวัติ"
      />
      {demo && <DemoBanner />}
      <TransferList transfers={transfers} groupNames={groupNames} mode="urgent" />
    </>
  );
}
