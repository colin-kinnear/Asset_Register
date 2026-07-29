-- TagPoint — initial schema.
-- Entities per the plan doc §05: category, location, cost_centre, asset,
-- maintenance_log, disposal, plus profiles (roles live here, not in auth.users).

create extension if not exists "pgcrypto";

create type user_role as enum ('admin', 'office', 'technician');
create type asset_status as enum ('active', 'in_repair', 'disposed');
create type maintenance_type as enum ('repair', 'inspection', 'service', 'other');
create type maintenance_status as enum ('open', 'in_progress', 'resolved');
create type disposal_type as enum ('sold', 'scrapped', 'written_off', 'lost');

-- One row per auth.users user. Role lives here (never trust a client-supplied
-- role claim) — see 0002_rls.sql for how this backs Row Level Security.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  role user_role not null default 'technician',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table category (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table location (
  id uuid primary key default gen_random_uuid(),
  site text not null,
  building text,
  floor text,
  room text,
  parent_location_id uuid references location (id) on delete set null,
  created_at timestamptz not null default now()
);

create table cost_centre (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  owner text,
  created_at timestamptz not null default now()
);

create table asset (
  id uuid primary key default gen_random_uuid(),
  asset_tag text not null unique,
  name text not null,
  description text,
  category_id uuid references category (id) on delete set null,
  location_id uuid references location (id) on delete set null,
  cost_centre_id uuid references cost_centre (id) on delete set null,
  status asset_status not null default 'active',
  serial_number text,
  manufacturer text,
  model text,
  purchase_date date,
  purchase_cost numeric(12, 2),
  useful_life_years numeric(5, 1),
  salvage_value numeric(12, 2) not null default 0,
  warranty_expiry date,
  insured_value numeric(12, 2),
  photo_url text,
  -- Opaque, non-sequential — see plan §06: printed on the QR label, must
  -- not let someone enumerate the whole register from one scanned code.
  qr_token uuid not null default gen_random_uuid() unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index asset_status_idx on asset (status);
create index asset_location_idx on asset (location_id);
create index asset_cost_centre_idx on asset (cost_centre_id);
create index asset_category_idx on asset (category_id);

create table maintenance_log (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references asset (id) on delete cascade,
  technician_id uuid not null references profiles (id),
  type maintenance_type not null,
  description text not null,
  status maintenance_status not null default 'open',
  photo_urls text[] not null default '{}',
  parts_cost numeric(12, 2),
  -- When the tech actually did the work (may be offline, backdated on sync)
  -- vs. when the row landed in Postgres — the gap is expected, not a bug.
  logged_at timestamptz not null default now(),
  synced_at timestamptz,
  created_at timestamptz not null default now()
);

create index maintenance_log_asset_idx on maintenance_log (asset_id);
create index maintenance_log_technician_idx on maintenance_log (technician_id);

create table disposal (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null unique references asset (id) on delete cascade,
  disposal_type disposal_type not null,
  disposal_date date not null,
  disposal_value numeric(12, 2),
  reason text,
  approved_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

-- Keep asset.updated_at honest without relying on every call site to set it.
create function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger asset_set_updated_at
  before update on asset
  for each row execute function set_updated_at();
