-- migration: create_categories
-- purpose: create categories table, enable rls with granular policies, seed initial data
-- table: categories
-- notes: static lookup table for product categories. translations handled by i18n in the mobile app.

create table categories (
  id           uuid        primary key default gen_random_uuid(),
  name         text        not null unique,   -- english name, e.g. 'Meat'
  slug         text        not null unique,   -- url-safe identifier, e.g. 'meat'
  created_at   timestamptz not null default now()
);

-- enable row level security
alter table categories enable row level security;

-- allow authenticated users to read all categories
create policy "authenticated_select_categories"
  on categories for select
  to authenticated
  using (true);

-- allow anonymous users to read all categories
create policy "anon_select_categories"
  on categories for select
  to anon
  using (true);

-- seed 6 mvp categories
insert into categories (name, slug) values
  ('Meat',       'meat'),
  ('Fish',       'fish'),
  ('Vegetables', 'vegetables'),
  ('Legumes',    'legumes'),
  ('Grains',     'grains'),
  ('Dairy',      'dairy');
