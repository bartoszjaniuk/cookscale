---
name: Supabase Migrations
description: Conventions for creating Supabase database migration files — naming, SQL style, RLS policies, and security guidelines.
applyTo: supabase/migrations/**
---

# Supabase Migration Conventions

This project uses migrations provided by the Supabase CLI. Migration files live in `supabase/migrations/`.

## File Naming

Migration files MUST follow the format `YYYYMMDDHHmmss_short_description.sql` using UTC time:

- `YYYY` — four-digit year
- `MM` — two-digit month (01–12)
- `DD` — two-digit day (01–31)
- `HH` — two-digit hour, 24h format (00–23)
- `mm` — two-digit minute (00–59)
- `ss` — two-digit second (00–59)

```
-- Correct
20240906123045_create_profiles.sql

-- Wrong
create_profiles.sql
2024-09-06_create_profiles.sql
```

## SQL Style

- Write all SQL in **lowercase**.
- Include a header comment with migration purpose, affected tables/columns, and special considerations.
- Add thorough comments explaining each migration step.
- Add copious comments before any **destructive** command (`drop`, `truncate`, column alterations).

```sql
-- Preferred
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  display_name text not null
);

-- Avoided
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL
);
```

## Row Level Security (RLS)

- **Always** enable RLS on new tables, even if intended for public access.
- Create **granular** policies — one per operation (`select`, `insert`, `update`, `delete`) and per Supabase role (`anon`, `authenticated`). Never combine policies.
- For public-access tables, the policy can simply return `true`.
- Include a comment explaining the rationale of each policy.

```sql
-- Preferred: granular, one policy per operation per role
alter table public.profiles enable row level security;

-- allow authenticated users to read all profiles
create policy "authenticated_select_profiles"
  on public.profiles for select
  to authenticated
  using (true);

-- allow anonymous users to read all profiles
create policy "anon_select_profiles"
  on public.profiles for select
  to anon
  using (true);

-- Avoided: combined roles or multiple operations in one policy
create policy "anyone_can_do_anything"
  on public.profiles for all
  using (true);
```
