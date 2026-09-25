-- LINE group chat dashboard schema
create extension if not exists "pgcrypto";

create table if not exists groups (
  id text primary key, -- LINE group id
  name text not null default 'Unnamed group',
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  group_id text not null references groups(id) on delete cascade,
  line_user_id text,
  display_name text,
  message_type text not null default 'text',
  message_text text,
  raw_event jsonb,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists messages_group_sent_idx on messages (group_id, sent_at desc);

create table if not exists summaries (
  id uuid primary key default gen_random_uuid(),
  group_id text not null references groups(id) on delete cascade,
  period_start timestamptz not null,
  period_end timestamptz not null,
  summary_text text not null,
  topics jsonb not null default '[]',
  action_items jsonb not null default '[]',
  sentiment text,
  message_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists summaries_group_created_idx on summaries (group_id, created_at desc);

-- Important messages the AI flags while reading group chats (shown on the Reports page).
create table if not exists important_messages (
  id uuid primary key default gen_random_uuid(),
  group_id text not null references groups(id) on delete cascade,
  message_id uuid references messages(id) on delete set null,
  display_name text,
  message_text text not null,
  reason text, -- why the AI considered it important
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists important_messages_group_sent_idx on important_messages (group_id, sent_at desc);

-- Money transfer requests detected in group chats (Urgent page).
-- Ticking one sets status = 'done' and moves it to the History page.
create table if not exists transfer_requests (
  id uuid primary key default gen_random_uuid(),
  group_id text not null references groups(id) on delete cascade,
  message_id uuid references messages(id) on delete set null,
  requested_by text,
  bank_name text,
  account_number text not null,
  account_name text not null,
  amount numeric(14, 2) not null,
  note text,
  status text not null default 'pending' check (status in ('pending', 'done')),
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists transfer_requests_status_idx on transfer_requests (status, requested_at desc);

-- Realtime: push a lightweight "something changed" signal to the dashboard.
-- Only the table name is broadcast (no row data), so the public channel leaks nothing;
-- the dashboard then re-fetches through the server.
create or replace function notify_dashboard_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform realtime.send(
    jsonb_build_object('table', TG_TABLE_NAME, 'op', TG_OP),
    'change',     -- event
    'dashboard',  -- topic
    false         -- public channel
  );
  return null;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['groups', 'messages', 'summaries', 'important_messages', 'transfer_requests']
  loop
    execute format('drop trigger if exists %I on %I', t || '_notify_dashboard', t);
    execute format(
      'create trigger %I after insert or update or delete on %I for each statement execute function notify_dashboard_change()',
      t || '_notify_dashboard', t
    );
  end loop;
end;
$$;
