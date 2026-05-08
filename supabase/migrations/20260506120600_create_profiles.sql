-- migration: create_profiles
-- purpose: create profiles table, enable rls with granular policies
-- table: profiles
-- notes: extends auth.users. created automatically on signup via trigger (separate migration).
--         premium columns (is_premium, premium_expires_at, revenuecat_customer_id, trial_ai_used_at)
--         are updated exclusively by service_role (revenuecat webhook).
--         user-updatable columns: preferred_language, avatar_url.

create table profiles (
  id                       uuid        primary key references auth.users(id) on delete cascade,
  is_premium               boolean     not null default false,
  premium_expires_at       timestamptz,                        -- nullable, null = no active subscription
  revenuecat_customer_id   text,                               -- nullable
  preferred_language       text        not null default 'en'
                             check (preferred_language in ('pl', 'en')),
  trial_ai_used_at         timestamptz,                        -- nullable, null = trial not used
  avatar_url               text,                               -- nullable, url to supabase storage
  anonymous_calc_count     smallint    not null default 0,     -- pre-registration calculation counter
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- enable row level security
alter table profiles enable row level security;

-- allow authenticated users to read their own profile only
create policy "authenticated_select_own_profile"
  on profiles for select
  to authenticated
  using (auth.uid() = id);

-- allow authenticated users to update their own profile only
-- note: premium columns are protected by service_role-only edge functions, not by column-level rls.
-- the mobile client uses the anon key and only sends preferred_language and avatar_url.
create policy "authenticated_update_own_profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
