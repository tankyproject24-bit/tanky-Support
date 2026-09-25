import type { GroupRow, SummaryRow } from "@/lib/types";

// Sample data shown on the dashboard until Supabase env vars are configured.
export function getDemoDashboardData(): {
  group: GroupRow;
  latestSummary: SummaryRow | null;
  messageCount24h: number;
}[] {
  const now = Date.now();
  const hoursAgo = (h: number) => new Date(now - h * 60 * 60 * 1000).toISOString();

  return [
    {
      group: { id: "demo-1", name: "ทีมซัพพอร์ตลูกค้า", created_at: hoursAgo(720) },
      messageCount24h: 128,
      latestSummary: {
        id: "demo-s1",
        group_id: "demo-1",
        period_start: hoursAgo(24),
        period_end: hoursAgo(1),
        summary_text:
          "วันนี้ลูกค้าแจ้งปัญหาการเข้าสู่ระบบหลายราย ทีมตรวจพบว่าเกิดจากการอัปเดตระบบเมื่อคืน และแก้ไขเรียบร้อยช่วงบ่าย นอกจากนี้มีคำถามเรื่องการคืนเงินและการเปลี่ยนแพ็กเกจเพิ่มขึ้น",
        topics: ["ปัญหาล็อกอิน", "การคืนเงิน", "เปลี่ยนแพ็กเกจ"],
        action_items: [
          "แจ้งลูกค้าที่ได้รับผลกระทบว่าแก้ไขแล้ว",
          "อัปเดต FAQ เรื่องการคืนเงิน",
          "สรุปรายชื่อลูกค้าที่ขอเปลี่ยนแพ็กเกจส่งฝ่ายขาย",
        ],
        sentiment: "mixed",
        message_count: 128,
        created_at: hoursAgo(1),
      },
    },
    {
      group: { id: "demo-2", name: "ฝ่ายขาย Tanky", created_at: hoursAgo(720) },
      messageCount24h: 56,
      latestSummary: {
        id: "demo-s2",
        group_id: "demo-2",
        period_start: hoursAgo(24),
        period_end: hoursAgo(3),
        summary_text:
          "ยอดขายสัปดาห์นี้เกินเป้า 12% ทีมหารือแผนโปรโมชันปลายเดือน และนัดประชุมกับลูกค้ารายใหญ่ 2 รายในสัปดาห์หน้า",
        topics: ["ยอดขาย", "โปรโมชัน", "ลูกค้ารายใหญ่"],
        action_items: ["เตรียมสไลด์นำเสนอลูกค้า", "ยืนยันงบโปรโมชันกับฝ่ายการเงิน"],
        sentiment: "positive",
        message_count: 56,
        created_at: hoursAgo(3),
      },
    },
    {
      group: { id: "demo-3", name: "ทีมพัฒนาระบบ", created_at: hoursAgo(720) },
      messageCount24h: 9,
      latestSummary: null,
    },
  ];
}
