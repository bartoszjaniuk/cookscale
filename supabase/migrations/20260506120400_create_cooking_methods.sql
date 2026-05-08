-- migration: create_cooking_methods
-- purpose: create cooking_methods table, enable rls with granular policies, seed initial data
-- table: cooking_methods
-- notes: static lookup table for thermal processing methods. 3 methods seeded for mvp. no is_active flag.

create table cooking_methods (
  id           uuid        primary key default gen_random_uuid(),
  slug         text        not null unique,   -- e.g. 'boiling', 'frying', 'baking'
  created_at   timestamptz not null default now()
);

-- enable row level security
alter table cooking_methods enable row level security;

-- allow authenticated users to read all cooking methods
create policy "authenticated_select_cooking_methods"
  on cooking_methods for select
  to authenticated
  using (true);

-- allow anonymous users to read all cooking methods
create policy "anon_select_cooking_methods"
  on cooking_methods for select
  to anon
  using (true);

-- seed 3 mvp cooking methods
insert into cooking_methods (slug) values
  ('boiling'),
  ('frying'),
  ('baking');
