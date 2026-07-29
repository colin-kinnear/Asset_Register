-- Auto-create a profiles row whenever a new user signs up via Supabase Auth.
-- New users default to 'technician' — an admin promotes them from there
-- (see profiles_admin_manage policy in 20260729000001_rls.sql).

create function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', new.email), new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
