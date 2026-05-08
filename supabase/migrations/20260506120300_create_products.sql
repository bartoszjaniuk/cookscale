-- migration: create_products
-- purpose: create products table, active_products view, enable rls with granular policies
-- table: products
-- view: active_products
-- notes: food products imported from usda and openfoodfacts. soft delete via deleted_at.
--         mutations only via service_role. usda takes priority on conflicts.

create table products (
  id                   uuid          primary key default gen_random_uuid(),
  external_id          text,                                  -- nullable; null for user-added products (post-mvp)
  source               source_enum   not null,
  ean                  text,                                  -- nullable, post-mvp (barcode scanning)
  created_by_user_id   uuid          references auth.users(id) on delete set null, -- nullable, post-mvp
  name                 text          not null,
  category_id          uuid          references categories(id) on delete set null,
  calories_kcal        numeric(6,2),
  protein_g            numeric(6,2),
  fat_g                numeric(6,2),
  carbs_g              numeric(6,2),
  fiber_g              numeric(6,2),
  sugar_g              numeric(6,2),
  sodium_mg            numeric(7,2),
  deleted_at           timestamptz,                           -- nullable, soft delete
  created_at           timestamptz   not null default now(),
  updated_at           timestamptz   not null default now()
);

-- view: only active (non-deleted) products for convenience
create view active_products as
  select * from products where deleted_at is null;

-- enable row level security
alter table products enable row level security;

-- allow authenticated users to read active (non-deleted) products
create policy "authenticated_select_products"
  on products for select
  to authenticated
  using (deleted_at is null);

-- allow anonymous users to read active (non-deleted) products
create policy "anon_select_products"
  on products for select
  to anon
  using (deleted_at is null);
