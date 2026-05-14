-- migration: add_eggs_category_and_product
-- purpose: add 'Eggs' category, 'Egg' product, and associated cooking factors.

-- 1. Insert Category
insert into categories (name, slug, icon)
values ('Eggs', 'eggs', '🥚')
on conflict (slug) do nothing;

-- 2. Insert Product
insert into products (
  external_id,
  source,
  name_en,
  name_pl,
  category_id,
  calories_kcal,
  protein_g,
  fat_g,
  carbs_g,
  fiber_g,
  sugar_g,
  sodium_mg,
  is_popular
)
select
  'usda-1123',
  'system'::source_enum,
  'Egg',
  'Jajko',
  c.id,
  143.0,
  12.56,
  9.51,
  0.72,
  0.0,
  0.37,
  142.0,
  true
from categories c
where c.slug = 'eggs'
and not exists (
  select 1 from products where name_en = 'Egg'
);

-- 3. Insert Cooking Factors
with factors (product_name, method_slug, yield_factor) as (
  values
  ('Egg', 'boiling', 0.9800::numeric),
  ('Egg', 'frying', 0.8900::numeric),
  ('Egg', 'baking', 0.8500::numeric)
)
insert into product_cooking_factors (product_id, cooking_method_id, yield_factor)
select
  p.id,
  m.id,
  f.yield_factor
from factors f
join products p
  on p.name_en = f.product_name
  and p.source = 'system'
  and p.deleted_at is null
join cooking_methods m
  on m.slug = f.method_slug
on conflict (product_id, cooking_method_id) do nothing;
