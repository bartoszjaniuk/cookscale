-- migration: add_spices_category_and_products
-- purpose: add Spices category, seed common dried spices/herbs with USDA macros,
--          assign none cooking method (yield_factor 1.0) — no thermal processing
-- affected tables: categories, products, product_cooking_factors
-- notes:
--   - new products use distinct name_en values to avoid collisions with fresh
--     vegetables (Garlic, Basil, Onion, Bell pepper)
--   - existing dried herbs (Oregano, Thyme, Rosemary, Sage, Nutmeg) are
--     re-categorised only; name_en is unchanged for calculation history integrity

-- 1. insert spices category
insert into categories (name, slug, icon)
values ('Spices', 'spices', '🧂')
on conflict (slug) do nothing;

-- 2. insert new spice products (14 rows)
insert into products (
  source,
  name_en,
  name_pl,
  category_id,
  calories_kcal,
  protein_g,
  fat_g,
  carbs_g,
  sodium_mg,
  is_popular
)
select
  'system'::source_enum,
  v.name_en,
  v.name_pl,
  c.id,
  v.calories_kcal,
  v.protein_g,
  v.fat_g,
  v.carbs_g,
  v.sodium_mg,
  v.is_popular
from (values
  ('Salt',              'sól',                    0,    0,    0,    0,    38758, true),
  ('Black Pepper',      'pieprz czarny',        251, 10.4,  3.3, 64.0,      20, true),
  ('Curry Powder',      'curry',                325, 14.3, 14.0, 55.8,    520, true),
  ('Granulated Garlic', 'czosnek granulowany',  331, 16.6,  0.7, 72.7,      60, true),
  ('Granulated Onion',  'cebula granulowana',   341, 10.4,  1.0, 79.1,      73, false),
  ('Dried Basil',       'bazylia suszona',      233, 23.0,  4.1, 47.8,      76, false),
  ('Poultry Seasoning', 'przyprawa do kurczaka',307,  9.6,  7.5, 65.6,    3840, false),
  ('Herb Seasoning',    'pieprz ziołowy',       255,  8.0,  5.0, 50.0,    6800, false),
  ('Sweet Paprika',     'papryka słodka',       282, 14.1, 12.9, 54.0,    1048, false),
  ('Ground Cinnamon',   'cynamon',              247,  4.0,  1.2, 80.6,      10, false),
  ('Ground Cumin',      'kmin rzymski',         375, 17.8, 22.3, 44.2,     168, false),
  ('Chili Powder',      'chili powder',         282, 13.5, 14.3, 49.7,    2867, false),
  ('Ground Ginger',     'imbir mielony',        335,  9.0,  4.2, 71.6,      27, false),
  ('Red Pepper Flakes', 'płatki chili',         318, 12.0, 17.3, 56.6,    2087, false)
) as v(name_en, name_pl, calories_kcal, protein_g, fat_g, carbs_g, sodium_mg, is_popular)
cross join categories c
where c.slug = 'spices'
  and not exists (
    select 1 from products p where p.name_en = v.name_en
  );

-- 3. move existing dried herbs/spices into spices category
update products
set category_id = (select id from categories where slug = 'spices')
where name_en in ('Oregano', 'Thyme', 'Rosemary', 'Sage', 'Nutmeg');

-- 4. add none cooking factor (yield 1.0) for all spices — no weight change, no thermal processing
do $$
declare
  v_none_method_id uuid;
begin
  select id into v_none_method_id from cooking_methods where slug = 'none';

  if v_none_method_id is null then
    raise exception 'cooking method none not found — run add_none_cooking_method migration first';
  end if;

  insert into product_cooking_factors (product_id, cooking_method_id, yield_factor)
  select p.id, v_none_method_id, 1.0
  from products p
  where p.deleted_at is null
    and p.source = 'system'
    and (
      p.category_id = (select id from categories where slug = 'spices')
      or p.name_en in ('Oregano', 'Thyme', 'Rosemary', 'Sage', 'Nutmeg')
    )
  on conflict (product_id, cooking_method_id) do nothing;
end $$;
