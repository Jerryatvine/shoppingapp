-- Shopping Tracker Schema
-- Run this once in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/psrtgpzjswdxrhsjksjl/sql/new

-- ── Items ──────────────────────────────────────────────────────────────────
create table if not exists items (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  type          text not null check (type in ('quantity', 'volume', 'weight')),
  category      text,
  default_unit  text,
  created_at    timestamptz default now()
);

-- ── Purchases ──────────────────────────────────────────────────────────────
create table if not exists purchases (
  id             uuid primary key default gen_random_uuid(),
  item_id        uuid not null references items(id) on delete cascade,
  date           date not null,
  total_price    numeric(10, 4) not null,
  amount         numeric(10, 4),
  unit           text,
  store          text,
  price_per_base numeric(12, 6),
  created_at     timestamptz default now()
);

-- ── Indexes ────────────────────────────────────────────────────────────────
create index if not exists purchases_item_id_idx on purchases(item_id);
create index if not exists purchases_date_idx    on purchases(date desc);

-- ── Row Level Security ─────────────────────────────────────────────────────
-- Enable RLS so only authenticated/anon users you allow can read/write.
-- For a personal app using the anon key, these open policies work fine.
-- Tighten them later if you add user auth.

alter table items     enable row level security;
alter table purchases enable row level security;

-- Allow all operations for the anon role (public / no login)
create policy "anon full access on items"
  on items for all
  to anon
  using (true)
  with check (true);

create policy "anon full access on purchases"
  on purchases for all
  to anon
  using (true)
  with check (true);
