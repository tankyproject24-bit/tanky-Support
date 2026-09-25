import Anthropic from "@anthropic-ai/sdk";

export type ChatSummary = {
  summary_text: string;
  topics: string[];
  action_items: string[];
  sentiment: string;
};

const SUMMARY_TOOL_NAME = "record_summary";

export async function summarizeConversation(
  transcript: string,
  groupName: string
): Promise<ChatSummary> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1500,
    system:
      "You summarize LINE group chat conversations in Thai for a business dashboard. Be concise and factual, do not invent information that isn't in the transcript.",
    messages: [
      {
        role: "user",
        content: `กลุ่ม: ${groupName}\n\nบทสนทนา (รูปแบบ [เวลา] ชื่อ: ข้อความ):\n${transcript}\n\nสรุปบทสนทนานี้`,
      },
    ],
    tools: [
      {
        name: SUMMARY_TOOL_NAME,
        description: "Record a structured summary of the group chat conversation.",
        input_schema: {
          type: "object",
          properties: {
            summary_text: {
              type: "string",
              description: "สรุปเนื้อหาการสนทนา 3-6 ประโยค เป็นภาษาไทย",
            },
            topics: {
              type: "array",
              items: { type: "string" },
              description: "หัวข้อหลักที่พูดถึง เป็นภาษาไทย",
            },
            action_items: {
              type: "array",
              items: { type: "string" },
              description: "สิ่งที่ต้องทำต่อ/ติดตามผล ถ้าไม่มีให้เป็น array ว่าง",
            },
            sentiment: {
              type: "string",
              description: "บรรยากาศการสนทนาโดยรวม เช่น positive, neutral, negative, mixed",
            },
          },
          required: ["summary_text", "topics", "action_items", "sentiment"],
        },
      },
    ],
    tool_choice: { type: "tool", name: SUMMARY_TOOL_NAME },
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.Messages.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) throw new Error("Claude did not return a structured summary");

  return toolUse.input as ChatSummary;
}
