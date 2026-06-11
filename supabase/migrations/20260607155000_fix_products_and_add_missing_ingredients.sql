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
INSERT INTO products (name_en, name_pl, calories_kcal, protein_g, fat_g, carbs_g)
VALUES 
    ('Milk 1.5% Fat', 'mleko 1.5%', 47, 3.3, 1.5, 4.8),
    ('Milk 2% Fat', 'mleko 2%', 50, 3.3, 2.0, 4.8),
    ('Milk 3.2% Fat', 'mleko 3.2%', 60, 3.3, 3.2, 4.8)
ON CONFLICT (name_en) DO UPDATE 
SET 
    name_pl = EXCLUDED.name_pl,
    calories_kcal = EXCLUDED.calories_kcal,
    protein_g = EXCLUDED.protein_g,
    fat_g = EXCLUDED.fat_g,
    carbs_g = EXCLUDED.carbs_g;

-- 5. Insert new missing products: spices and condiments
INSERT INTO products (name_en, name_pl, calories_kcal, protein_g, fat_g, carbs_g)
VALUES 
    ('Worcestershire Sauce', 'sos worcestershire', 78, 0, 0, 19),
    ('Nutmeg', 'gałka muszkatołowa', 525, 5.8, 36.3, 49.3)
ON CONFLICT (name_en) DO UPDATE 
SET 
    name_pl = EXCLUDED.name_pl,
    calories_kcal = EXCLUDED.calories_kcal,
    protein_g = EXCLUDED.protein_g,
    fat_g = EXCLUDED.fat_g,
    carbs_g = EXCLUDED.carbs_g;
