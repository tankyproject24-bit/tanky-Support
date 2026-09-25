# LINE Group Insights

แดชบอร์ดที่อ่านข้อความจากกลุ่ม LINE ผ่าน LINE Messaging API แล้วใช้ Claude สรุปเนื้อหา หัวข้อ สิ่งที่ต้องทำ และบรรยากาศการสนทนา เก็บข้อมูลใน Supabase (PostgreSQL)

## สถาปัตยกรรม

```
LINE กลุ่ม → LINE Messaging API (webhook) → /api/line/webhook → Supabase (messages, groups)
                                                                        │
                                                    /api/summarize ─────┘
                                                    (Claude API สรุปข้อความ → summaries table)
                                                                        │
                                                    หน้า Dashboard (/) อ่านจาก Supabase
```

## ตั้งค่าเริ่มต้น

### 1. Supabase

1. สร้างโปรเจกต์ใหม่ที่ [supabase.com](https://supabase.com)
2. ไปที่ SQL Editor แล้วรันไฟล์ [`supabase/schema.sql`](./supabase/schema.sql) เพื่อสร้างตาราง `groups`, `messages`, `summaries`, `important_messages`, `transfer_requests` และ trigger สำหรับ Realtime
3. เอาค่า Project URL, `service_role` key และ `anon` (publishable) key จาก Project Settings → API มาใส่ใน `.env.local`
4. Realtime: ตรวจว่า Project Settings → Realtime เปิด "Allow public access" ไว้ — หน้าเว็บฟังช่อง `dashboard` ซึ่งส่งแค่ชื่อตารางที่เปลี่ยน (ไม่มีข้อมูลจริง) แล้วดึงข้อมูลใหม่จากเซิร์ฟเวอร์เอง

### 2. LINE Developers Console

1. สร้าง Provider และ Messaging API Channel ที่ [developers.line.biz](https://developers.line.biz)
2. เปิดใช้งาน Webhook และตั้ง Webhook URL เป็น `https://<โดเมนของคุณ>/api/line/webhook`
3. เอา Channel secret และ Channel access token (long-lived) มาใส่ใน `.env.local`
4. เชิญบอทเข้ากลุ่ม LINE ที่ต้องการสรุป (บอทจะเห็นเฉพาะข้อความที่ส่งหลังจากเข้ากลุ่มแล้วเท่านั้น ซึ่งเป็นข้อจำกัดของ LINE)
5. ปิด auto-reply/greeting message เริ่มต้นถ้าไม่ต้องการให้บอทตอบกลับในกลุ่ม

### 3. Anthropic (Claude API)

สร้าง API key ที่ [console.anthropic.com](https://console.anthropic.com) แล้วใส่ใน `.env.local`

### 4. ตัวแปรแวดล้อม

คัดลอก `.env.local.example` เป็น `.env.local` แล้วกรอกค่าทั้งหมด:

```bash
cp .env.local.example .env.local
```

## พัฒนา

```bash
npm install
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

สำหรับทดสอบ webhook ในเครื่อง ต้อง expose localhost ออกไปนอกเครื่อง (เช่นด้วย `ngrok http 3000`) แล้วเอา URL ที่ได้ไปตั้งใน LINE Developers Console

## การสรุปข้อความ

- กดปุ่ม **"สรุปตอนนี้"** บนแดชบอร์ดเพื่อสรุปข้อความย้อนหลัง 24 ชั่วโมงของกลุ่มนั้น (หรือทุกกลุ่มถ้ากดปุ่มบนหัวข้อ)
- หรือเรียก `POST /api/summarize` ตรงๆ ด้วย body `{ "groupId": "...", "hours": 24 }` (ละ `groupId` เพื่อสรุปทุกกลุ่ม)
- ตั้ง `SUMMARIZE_CRON_SECRET` ใน env แล้วส่ง header `x-cron-secret` เพื่อป้องกัน endpoint นี้ และตั้ง cron job (เช่น Vercel Cron) ให้เรียกอัตโนมัติทุกวัน

## Deploy

แนะนำ [Vercel](https://vercel.com/new) — เชื่อมต่อ repo แล้วใส่ environment variables ชุดเดียวกับ `.env.local` ในหน้า Project Settings จากนั้นตั้ง Webhook URL ใน LINE Developers Console ให้ชี้ไปที่โดเมน production
