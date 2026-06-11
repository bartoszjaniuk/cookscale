-- Migration: Fix products and add missing ingredients
-- Purpose: Improve product naming for Polish language and add missing ingredients like milk variants, spices, and condiments
-- Affected tables: products

-- 1. Fix "Wheat" to "Wheat Flour" and ensure Polish name is "mąka pszenna"
UPDATE products 
SET 
    name_en = 'Wheat Flour',
    name_pl = 'mąka pszenna'
WHERE name_en = 'Wheat' OR name_pl = 'pszenica';

-- 2. Update Mustard greens to just Mustard or add ground mustard
UPDATE products
SET
    name_en = 'Mustard',
    name_pl = 'musztarda'
WHERE name_en = 'Mustard greens' OR name_pl = 'gorczyca sarepska';

-- 3. Verify and update Blue cheese if needed
UPDATE products
SET
    name_pl = 'ser z niebieską pleśnią'
WHERE name_en = 'Blue cheese' AND (name_pl IS NULL OR name_pl != 'ser z niebieską pleśnią');

-- 4. Insert new missing products: milk variants
-- products.name_en has no unique constraint; use NOT EXISTS (same pattern as add_eggs_category_and_product)
insert into products (source, name_en, name_pl, calories_kcal, protein_g, fat_g, carbs_g)
select
    'system'::source_enum,
    v.name_en,
    v.name_pl,
    v.calories_kcal,
    v.protein_g,
    v.fat_g,
    v.carbs_g
from (values
    ('Milk 1.5% Fat', 'mleko 1.5%', 47, 3.3, 1.5, 4.8),
    ('Milk 2% Fat', 'mleko 2%', 50, 3.3, 2.0, 4.8),
    ('Milk 3.2% Fat', 'mleko 3.2%', 60, 3.3, 3.2, 4.8)
) as v(name_en, name_pl, calories_kcal, protein_g, fat_g, carbs_g)
where not exists (
    select 1 from products p where p.name_en = v.name_en
);

-- 5. Insert new missing products: spices and condiments
insert into products (source, name_en, name_pl, calories_kcal, protein_g, fat_g, carbs_g)
select
    'system'::source_enum,
    v.name_en,
    v.name_pl,
    v.calories_kcal,
    v.protein_g,
    v.fat_g,
    v.carbs_g
from (values
    ('Worcestershire Sauce', 'sos worcestershire', 78, 0, 0, 19),
    ('Nutmeg', 'gałka muszkatołowa', 525, 5.8, 36.3, 49.3)
) as v(name_en, name_pl, calories_kcal, protein_g, fat_g, carbs_g)
where not exists (
    select 1 from products p where p.name_en = v.name_en
);
