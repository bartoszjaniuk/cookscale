-- migration: create_product_cooking_factors
-- purpose: create product_cooking_factors table, enable rls with granular policies
-- table: product_cooking_factors
-- notes: yield factors per product + cooking method combination.
--         missing row = method unavailable for that product (edge function returns error, ui filters).
--         implements m:n relationship between products and cooking_methods.

create table product_cooking_factors (
  id                 uuid          primary key default gen_random_uuid(),
  product_id         uuid          not null references products(id) on delete cascade,
  cooking_method_id  uuid          not null references cooking_methods(id) on delete restrict,
  yield_factor       numeric(5,4) not null,   -- e.g. 0.7500 means product loses 25% mass

  -- unique combination of product and cooking method
  constraint uq_product_cooking_factors unique (product_id, cooking_method_id),
  -- yield factor must be positive and at most 10x (reasonable upper bound)
  constraint chk_yield_factor_range check (yield_factor > 0 and yield_factor <= 10)
);

-- enable row level security
alter table product_cooking_factors enable row level security;

-- allow authenticated users to read all cooking factors
create policy "authenticated_select_product_cooking_factors"
  on product_cooking_factors for select
  to authenticated
  using (true);

-- allow anonymous users to read all cooking factors
create policy "anon_select_product_cooking_factors"
  on product_cooking_factors for select
  to anon
  using (true);
