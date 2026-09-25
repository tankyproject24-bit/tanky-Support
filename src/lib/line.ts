import crypto from "crypto";

export function verifyLineSignature(
  rawBody: string,
  signature: string | null,
  channelSecret: string
): boolean {
  if (!signature) return false;
  const hash = crypto
    .createHmac("sha256", channelSecret)
    .update(rawBody)
    .digest("base64");
  // timingSafeEqual requires equal-length buffers
  const a = Buffer.from(hash);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function getGroupMemberDisplayName(
  groupId: string,
  userId: string,
  channelAccessToken: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.line.me/v2/bot/group/${groupId}/member/${userId}`,
      { headers: { Authorization: `Bearer ${channelAccessToken}` } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { displayName?: string };
    return data.displayName ?? null;
  } catch {
    return null;
  }
}

export async function getGroupSummary(
  groupId: string,
  channelAccessToken: string
): Promise<{ groupName?: string } | null> {
  try {
    const res = await fetch(
      `https://api.line.me/v2/bot/group/${groupId}/summary`,
      { headers: { Authorization: `Bearer ${channelAccessToken}` } }
    );
    if (!res.ok) return null;
    return (await res.json()) as { groupName?: string };
  } catch {
    return null;
  }
}

// Minimal shape of the LINE webhook events we care about.
export type LineWebhookEvent = {
  type: string;
  source?: {
    type: string;
    groupId?: string;
    userId?: string;
  };
  message?: {
    type: string;
    text?: string;
  };
  timestamp: number;
};
