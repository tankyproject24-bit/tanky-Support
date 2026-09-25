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
