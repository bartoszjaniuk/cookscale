-- migration: fix_create_profile_on_signup_search_path
-- purpose: fix "database error creating new user" by adding set search_path = ''
--          and using a fully-qualified table name in the security definer function.
-- function: fn_create_profile_on_signup
-- notes: security definer functions without a fixed search_path can fail to
--         resolve unqualified table names (e.g. 'profiles') depending on the
--         session search_path, causing the auth.users insert to be rolled back
--         and surfacing as "database error creating new user" in the dashboard.

create or replace function fn_create_profile_on_signup()
  returns trigger
  language plpgsql
  security definer
  set search_path = '' -- prevent search_path injection; forces fully-qualified names
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;
