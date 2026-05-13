-- Clarity 4K — Supabase Schema
-- Run this in the Supabase SQL Editor to set up your database.

create extension if not exists "uuid-ossp";

-- ── Talent ───────────────────────────────────────────────────────────────────
create table if not exists talent (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  stage_name    text,
  email         text unique not null,
  phone         text,
  nationality   text,
  bio           text,
  avatar        text,
  status        text not null default 'ACTIVE',   -- ACTIVE | INACTIVE | PENDING
  tier          text not null default 'STANDARD', -- STANDARD | PREMIUM | ELITE
  joined_at     timestamptz not null default now(),
  contract_end  timestamptz,
  platform_links text,  -- JSON string { onlyfans, instagram, tiktok, … }
  social_links   text,  -- JSON string
  tags           text,  -- comma-separated
  agency_fee     float not null default 20,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── Earnings ─────────────────────────────────────────────────────────────────
create table if not exists earnings (
  id          uuid primary key default uuid_generate_v4(),
  talent_id   uuid not null references talent(id) on delete cascade,
  platform    text not null,
  amount      float not null,
  currency    text not null default 'USD',
  month       int  not null,
  year        int  not null,
  description text,
  created_at  timestamptz not null default now()
);

-- ── Expenses ─────────────────────────────────────────────────────────────────
create table if not exists expenses (
  id          uuid primary key default uuid_generate_v4(),
  talent_id   uuid not null references talent(id) on delete cascade,
  category    text not null,
  amount      float not null,
  currency    text not null default 'USD',
  date        timestamptz not null,
  description text,
  created_at  timestamptz not null default now()
);

-- ── Campaigns ────────────────────────────────────────────────────────────────
create table if not exists campaigns (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text,
  type        text not null, -- LAUNCH | PROMOTION | COLLAB | SEASONAL | SOCIAL_PUSH
  status      text not null default 'DRAFT', -- DRAFT | ACTIVE | PAUSED | COMPLETED
  start_date  timestamptz not null,
  end_date    timestamptz,
  budget      float,
  spent       float not null default 0,
  goal        text,
  platform    text,
  metrics     text, -- JSON: { impressions, clicks, conversions, revenue }
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Campaign ↔ Talent ────────────────────────────────────────────────────────
create table if not exists campaign_talent (
  id          uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  talent_id   uuid not null references talent(id)   on delete cascade,
  unique(campaign_id, talent_id)
);

-- ── Notes ────────────────────────────────────────────────────────────────────
create table if not exists notes (
  id         uuid primary key default uuid_generate_v4(),
  talent_id  uuid not null references talent(id) on delete cascade,
  content    text not null,
  author     text not null,
  created_at timestamptz not null default now()
);

-- ── Agency Settings ──────────────────────────────────────────────────────────
create table if not exists agency_settings (
  id            text primary key default 'default',
  agency_name   text not null default 'Clarity 4K',
  logo_url      text,
  currency      text not null default 'USD',
  default_fee   float not null default 20,
  contact_email text,
  contact_phone text,
  address       text,
  tax_id        text
);

insert into agency_settings (id) values ('default') on conflict (id) do nothing;

-- ── Disable RLS (admin platform — all users are trusted staff) ───────────────
alter table talent          disable row level security;
alter table earnings        disable row level security;
alter table expenses        disable row level security;
alter table campaigns       disable row level security;
alter table campaign_talent disable row level security;
alter table notes           disable row level security;
alter table agency_settings disable row level security;
