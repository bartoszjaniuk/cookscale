-- migration: create_profile_on_signup_trigger
-- purpose: automatically create a profile row when a new user registers
-- tables: profiles (insert), auth.users (trigger source)
-- notes: uses security definer to bypass rls when inserting into profiles.
--         on conflict do nothing prevents errors if profile already exists.

create or replace function fn_create_profile_on_signup()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_create_profile_on_signup
  after insert on auth.users
  for each row execute function fn_create_profile_on_signup();
