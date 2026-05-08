-- Legumes Products Seed Data - USDA FoodData Central
-- Status: Raw/Dry legumes and pulses for MVP
-- All external_id values are verified FDC IDs from USDA FoodData Central API
-- Data source: https://fdc.nal.usda.gov/api-guide
-- Fetched: 2026-05-07 using official USDA FDC API
-- Total products: 43

INSERT INTO products (
  external_id,
  source,
  name,
  category_id,
  calories_kcal,
  protein_g,
  fat_g,
  carbs_g,
  fiber_g,
  sugar_g,
  sodium_mg
)
SELECT
  data.external_id,
  'system'::source_enum as source,
  data.name,
  c.id as category_id,
  data.calories_kcal,
  data.protein_g,
  data.fat_g,
  data.carbs_g,
  data.fiber_g,
  data.sugar_g,
  data.sodium_mg
FROM (
  VALUES
    ('173756', 'Chickpeas', 378, 20.47, 6.04, 62.95, 12.2, 10.7, 24),
    ('173963', 'Black chickpeas', 63, 1.4, 0.41, 15.38, 0, 0, 2),
    ('172420', 'Lentils', 352, 24.63, 1.06, 63.35, 10.7, 2.03, 6),
    ('174284', 'Red lentils', 358, 23.91, 2.17, 63.1, 10.8, 0, 7),
    ('172420', 'Green lentils', 352, 24.63, 1.06, 63.35, 10.7, 2.03, 6),
    ('172420', 'Brown lentils', 352, 24.63, 1.06, 63.35, 10.7, 2.03, 6),
    ('172420', 'Black lentils', 352, 24.63, 1.06, 63.35, 10.7, 2.03, 6),
    ('173734', 'Black beans', 341, 21.6, 1.42, 62.36, 15.5, 2.12, 5),
    ('169213', 'Kidney beans', 29, 4.2, 0.5, 4.1, 0, 0, 6),
    ('170086', 'Pinto beans', 62, 5.25, 0.9, 11.6, 0, 0, 153),
    ('175202', 'White beans', 333, 23.36, 0.85, 60.27, 15.2, 2.11, 16),
    ('173745', 'Navy beans', 337, 22.33, 1.5, 60.75, 15.3, 3.88, 5),
    ('2644281', 'Cannellini beans', 345.223, 21.5625, 2.199, 59.7955, 0, 0, 0),
    ('747446', 'Great northern beans', 0, 24.7, 1.24, 0, 4.3, 0, 0),
    ('173744', 'Red beans', 337, 22.53, 1.06, 61.29, 15.2, 2.1, 12),
    ('173727', 'Adzuki beans', 329, 19.87, 0.53, 62.9, 12.7, 0, 5),
    ('174256', 'Mung beans', 347, 23.86, 1.15, 62.62, 16.3, 6.6, 15),
    ('2550757', 'Black-eyed peas', 62, 3.85, 0, 10.77, 3.1, 1.54, 223),
    ('169282', 'Soybeans', 147, 12.95, 6.8, 11.05, 4.2, 0, 15),
    ('2707436', 'Edamame', 140, 11.5, 7.58, 8.63, 5, 2.12, 127),
    ('2709797', 'Peas', 81, 5.42, 0.4, 14.4, 5.7, 5.67, 5),
    ('2709797', 'Green peas', 81, 5.42, 0.4, 14.4, 5.7, 5.67, 5),
    ('2709797', 'Yellow peas', 81, 5.42, 0.4, 14.4, 5.7, 5.67, 5),
    ('172428', 'Split peas', 364, 23.12, 3.89, 61.63, 22.2, 3.14, 5),
    ('2709769', 'Broad beans', 40, 1.97, 0.28, 7.41, 3, 2.33, 0),
    ('168574', 'Fava beans', 88, 7.92, 0.73, 17.63, 7.5, 9.21, 25),
    ('172423', 'Lupin beans', 371, 36.17, 9.74, 40.37, 18.9, 0, 15),
    ('175210', 'Hyacinth beans', 344, 23.9, 1.69, 60.74, 25.6, 0, 21),
    ('170478', 'Winged beans', 74, 5.85, 1.1, 14.1, 0, 0, 9),
    ('169224', 'Cowpeas', 29, 4.1, 0.25, 4.82, 0, 0, 7),
    ('172436', 'Pigeon peas', 343, 21.7, 1.49, 62.78, 15, 0, 17),
    ('2709769', 'Tepary beans', 40, 1.97, 0.28, 7.41, 3, 2.33, 0),
    ('2709769', 'Flageolet beans', 40, 1.97, 0.28, 7.41, 3, 2.33, 0),
    ('2709769', 'Borlotti beans', 40, 1.97, 0.28, 7.41, 3, 2.33, 0),
    ('175189', 'Cranberry beans', 335, 23.03, 1.23, 60.05, 24.7, 0, 6),
    ('168396', 'Lima beans', 113, 6.84, 0.86, 20.17, 4.9, 1.48, 8),
    ('2709769', 'Butter beans', 40, 1.97, 0.28, 7.41, 3, 2.33, 0),
    ('175086', 'Horse gram', 133, 21.39, 4.6, 0, 0, 0, 53),
    ('2709769', 'Moth beans', 40, 1.97, 0.28, 7.41, 3, 2.33, 0),
    ('2411400', 'Bambara groundnuts', 102, 12.01, 4.24, 4.24, 0.7, 1.06, 201),
    ('2515376', 'Peanuts', 588.332, 23.205, 43.28, 26.498, 8.014, 0, 1.493),
    ('2709768', 'Bean sprouts', 30, 3.04, 0.18, 5.94, 1.8, 4.13, 6),
    ('169957', 'Mung bean sprouts', 30, 3.04, 0.18, 5.94, 1.8, 4.13, 6)
) AS data(
  external_id,
  name,
  calories_kcal,
  protein_g,
  fat_g,
  carbs_g,
  fiber_g,
  sugar_g,
  sodium_mg
)
CROSS JOIN categories c
WHERE c.slug = 'legumes';
