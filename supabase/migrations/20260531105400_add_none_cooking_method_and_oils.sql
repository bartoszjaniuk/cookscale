-- migration: add_none_cooking_method_and_oils
-- purpose: add 'none' cooking method and oil products with 1.0 yield_factor
-- tables: cooking_methods, products, product_cooking_factors

do $$
declare
  v_none_method_id uuid;
begin
  -- 1. Insert 'none' cooking method
  insert into cooking_methods (slug)
  values ('none')
  on conflict (slug) do update set slug = excluded.slug
  returning id into v_none_method_id;

  -- If it already existed but returning didn't catch it
  if v_none_method_id is null then
    select id into v_none_method_id from cooking_methods where slug = 'none';
  end if;

  -- 2. Insert new oil products and their factors
  with new_products as (
    insert into products (source, name_en, name_pl, calories_kcal, protein_g, fat_g, carbs_g, fiber_g, sugar_g, sodium_mg)
    values
      ('system', 'Olive oil', 'Oliwa z oliwek', 884, 0, 100, 0, 0, 0, 2),
      ('system', 'Vegetable oil', 'Olej roślinny', 884, 0, 100, 0, 0, 0, 0),
      ('system', 'Canola oil', 'Olej rzepakowy', 884, 0, 100, 0, 0, 0, 0),
      ('system', 'Coconut oil', 'Olej kokosowy', 862, 0, 100, 0, 0, 0, 0),
      ('system', 'Lard', 'Smalec', 902, 0, 100, 0, 0, 0, 0)
    returning id
  )
  insert into product_cooking_factors (product_id, cooking_method_id, yield_factor)
  select id, v_none_method_id, 1.0
  from new_products;

  -- 3. Add 'none' factor (1.0) to existing butter-like products
  insert into product_cooking_factors (product_id, cooking_method_id, yield_factor)
  select id, v_none_method_id, 1.0
  from products
  where name_en in (
    'Butter',
    'Salted butter',
    'Unsalted butter',
    'Clarified butter',
    'Ghee'
  )
  on conflict (product_id, cooking_method_id) do nothing;

end $$;
