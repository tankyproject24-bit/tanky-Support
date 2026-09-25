export type GroupRow = {
  id: string;
  name: string;
  created_at: string;
};

export type MessageRow = {
  id: string;
  group_id: string;
  line_user_id: string | null;
  display_name: string | null;
  message_type: string;
  message_text: string | null;
  raw_event: unknown;
  sent_at: string;
  created_at: string;
};

export type SummaryRow = {
  id: string;
  group_id: string;
  period_start: string;
  period_end: string;
  summary_text: string;
  topics: string[];
  action_items: string[];
  sentiment: string | null;
  message_count: number;
  created_at: string;
};

export type ImportantMessageRow = {
  id: string;
  group_id: string;
  message_id: string | null;
  display_name: string | null;
  message_text: string;
  reason: string | null;
  sent_at: string;
  created_at: string;
};

export type TransferStatus = "pending" | "done";

export type TransferRequestRow = {
  id: string;
  group_id: string;
  message_id: string | null;
  requested_by: string | null;
  bank_name: string | null;
  account_number: string;
  account_name: string;
  amount: number;
  note: string | null;
  status: TransferStatus;
  requested_at: string;
  completed_at: string | null;
  created_at: string;
};
