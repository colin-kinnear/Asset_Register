-- Row Level Security — roles enforced at the database layer per plan §07,
-- not only in the UI. Review before go-live; this is a starting point.

-- security definer + a fixed search_path: reads profiles.role without
-- recursing back through this table's own RLS policies.
create function current_role() returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql stable security definer set search_path = public;

create function is_admin_or_office() returns boolean as $$
  select current_role() in ('admin', 'office');
$$ language sql stable security definer set search_path = public;

alter table profiles enable row level security;
alter table category enable row level security;
alter table location enable row level security;
alter table cost_centre enable row level security;
alter table asset enable row level security;
alter table maintenance_log enable row level security;
alter table disposal enable row level security;

-- profiles: everyone can read their own row; admin/office can read everyone
-- (needed to assign technicians, show names on maintenance logs, etc).
-- Only admin can change a role — nobody can promote themselves.
create policy profiles_select on profiles for select
  using (id = auth.uid() or is_admin_or_office());

create policy profiles_update_self on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = current_role());

create policy profiles_admin_manage on profiles for all
  using (current_role() = 'admin')
  with check (current_role() = 'admin');

-- category / location / cost_centre: read for any signed-in user,
-- write restricted to admin/office (§07 — technicians never edit these).
create policy lookup_select_category on category for select using (auth.role() = 'authenticated');
create policy lookup_write_category on category for all
  using (is_admin_or_office()) with check (is_admin_or_office());

create policy lookup_select_location on location for select using (auth.role() = 'authenticated');
create policy lookup_write_location on location for all
  using (is_admin_or_office()) with check (is_admin_or_office());

create policy lookup_select_cost_centre on cost_centre for select using (auth.role() = 'authenticated');
create policy lookup_write_cost_centre on cost_centre for all
  using (is_admin_or_office()) with check (is_admin_or_office());

-- asset: read for any signed-in user (including technicians, via QR scan);
-- write restricted to admin/office — technicians log maintenance instead
-- of editing the asset record itself.
create policy asset_select on asset for select using (auth.role() = 'authenticated');
create policy asset_write on asset for all
  using (is_admin_or_office()) with check (is_admin_or_office());

-- maintenance_log: any signed-in user can read (history is useful to
-- everyone); a technician can only insert/update their own entries;
-- admin/office can manage all of them (e.g. to close out an issue).
create policy maintenance_log_select on maintenance_log for select using (auth.role() = 'authenticated');

create policy maintenance_log_insert_own on maintenance_log for insert
  with check (technician_id = auth.uid() or is_admin_or_office());

create policy maintenance_log_update_own on maintenance_log for update
  using (technician_id = auth.uid() or is_admin_or_office())
  with check (technician_id = auth.uid() or is_admin_or_office());

create policy maintenance_log_admin_delete on maintenance_log for delete
  using (is_admin_or_office());

-- disposal: admin/office only, both directions.
create policy disposal_select on disposal for select using (auth.role() = 'authenticated');
create policy disposal_write on disposal for all
  using (is_admin_or_office()) with check (is_admin_or_office());
