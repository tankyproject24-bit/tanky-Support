import type {
  GroupRow,
  ImportantMessageRow,
  SummaryRow,
  TransferRequestRow,
} from "@/lib/types";

// Sample data shown on the dashboard until Supabase env vars are configured.

const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

export const demoGroups: GroupRow[] = [
  { id: "demo-1", name: "ทีมซัพพอร์ตลูกค้า", created_at: hoursAgo(720) },
  { id: "demo-2", name: "ฝ่ายขาย Tanky", created_at: hoursAgo(720) },
  { id: "demo-3", name: "ทีมพัฒนาระบบ", created_at: hoursAgo(720) },
];

export const demoMessageCount24h: Record<string, number> = {
  "demo-1": 128,
  "demo-2": 56,
  "demo-3": 9,
};

export function getDemoSummaries(): SummaryRow[] {
  return [
    {
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
    {
      id: "demo-s1-old",
      group_id: "demo-1",
      period_start: hoursAgo(48),
      period_end: hoursAgo(25),
      summary_text:
        "ลูกค้าสอบถามวิธีตั้งค่าบัญชีใหม่และขอใบเสร็จย้อนหลัง ทีมตอบครบทุกเคส ไม่มีปัญหาค้าง",
      topics: ["ตั้งค่าบัญชี", "ใบเสร็จ"],
      action_items: [],
      sentiment: "positive",
      message_count: 74,
      created_at: hoursAgo(25),
    },
    {
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
  ];
}

export function getDemoImportantMessages(): ImportantMessageRow[] {
  const row = (
    id: string,
    group_id: string,
    display_name: string,
    message_text: string,
    reason: string,
    h: number
  ): ImportantMessageRow => ({
    id,
    group_id,
    message_id: null,
    display_name,
    message_text,
    reason,
    sent_at: hoursAgo(h),
    created_at: hoursAgo(h),
  });

  return [
    row("demo-i1", "demo-1", "สมชาย", "ระบบล็อกอินล่มตั้งแต่ 9 โมง ลูกค้าเข้าไม่ได้เลยครับ", "ปัญหาระบบกระทบลูกค้า", 20),
    row("demo-i2", "demo-1", "มาลี", "แก้ไขเรียบร้อยแล้วค่ะ ใช้งานได้ปกติ", "ปิดปัญหาแล้ว", 16),
    row("demo-i3", "demo-1", "สมชาย", "ลูกค้า ABC ขอคืนเงิน 2,500 บาท รบกวนอนุมัติด้วยครับ", "ขออนุมัติคืนเงิน", 5),
    row("demo-i4", "demo-2", "วิภา", "นัดลูกค้า XYZ วันอังคาร 10 โมง ที่ออฟฟิศ", "นัดหมายสำคัญ", 8),
    row("demo-i5", "demo-2", "ธนา", "ปิดการขายโปรเจกต์ใหญ่ได้แล้ว มูลค่า 450,000 บาท", "ยอดขายสำคัญ", 4),
  ];
}

// Seed for the Urgent/History pages. Demo "ticks" only change client state.
export function getDemoTransfers(): TransferRequestRow[] {
  const row = (
    id: string,
    group_id: string,
    requested_by: string,
    bank_name: string,
    account_number: string,
    account_name: string,
    amount: number,
    note: string,
    h: number,
    completedH: number | null
  ): TransferRequestRow => ({
    id,
    group_id,
    message_id: null,
    requested_by,
    bank_name,
    account_number,
    account_name,
    amount,
    note,
    status: completedH === null ? "pending" : "done",
    requested_at: hoursAgo(h),
    completed_at: completedH === null ? null : hoursAgo(completedH),
    created_at: hoursAgo(h),
  });

  return [
    row("demo-t1", "demo-1", "สมชาย", "กสิกรไทย", "123-4-56789-0", "บริษัท เอบีซี จำกัด", 2500, "คืนเงินลูกค้า ABC", 5, null),
    row("demo-t2", "demo-2", "วิภา", "ไทยพาณิชย์", "987-6-54321-0", "นางสาว วิภา ใจดี", 12800, "ค่าบูธงานแสดงสินค้า", 3, null),
    row("demo-t3", "demo-2", "ธนา", "กรุงเทพ", "555-0-12345-6", "ร้าน ป้ายสวย", 4350.5, "ค่าป้ายโปรโมชัน", 1, null),
    row("demo-t4", "demo-1", "มาลี", "กรุงไทย", "111-2-33333-4", "นาย ประยุทธ์ รักงาน", 1500, "ค่าเดินทางซ่อมเครื่อง", 30, 26),
    row("demo-t5", "demo-3", "อนุชา", "กสิกรไทย", "222-3-44444-5", "บริษัท คลาวด์โฮสต์ จำกัด", 8900, "ค่าเซิร์ฟเวอร์รายเดือน", 50, 47),
  ];
}
