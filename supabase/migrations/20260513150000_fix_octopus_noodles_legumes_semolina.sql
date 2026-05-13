-- migration: fix_octopus_noodles_legumes_semolina
-- purpose: third and final pass of yield_factor corrections
-- table: product_cooking_factors
--
-- verification method for all values below:
--   protein retention ratio = protein_per_100g_raw / protein_per_100g_cooked
--   this ratio removes moisture and gives the true mass multiplication factor
--   source: usda foodata central (fdc.nal.usda.gov), usda sr28
--
-- seven errors corrected:
--
--   1. octopus boiling 0.75 → 0.50
--      usda fdc #174177 cooked: 29.8 g protein/100 g
--      usda fdc #174176 raw:    14.9 g protein/100 g
--      factor = 14.9 / 29.8 = 0.500 — octopus is famous for 50% mass loss when boiled;
--      the original value (0.75) is simply wrong by ~50% relative error
--
--   2. egg noodles boiling 2.0 → 2.8
--      usda fdc #20306 cooked: 3.83 g protein/100 g
--      usda fdc #20304 dry:    12.3 g protein/100 g
--      factor = 12.3 / 3.83 = 3.21×; practical kitchen ratio: 57 g dry → 160 g cooked = 2.81×
--      adopting 2.80 (practical value; protein can leach slightly into cooking water)
--
--   3. soba noodles boiling 2.0 → 2.9
--      usda fdc #20109 cooked: 5.08 g protein/100 g
--      dry soba: 14.6 g protein/100 g
--      factor = 14.6 / 5.08 = 2.87×; practical: 100 g dry → 285 g cooked = 2.85×
--
--   4. udon noodles boiling 2.0 → 2.5
--      usda fdc: cooked udon ~4.0 g protein/100 g; dry ~10 g protein/100 g
--      factor = 10 / 4.0 = 2.50× (udon is thick and absorbs less water than thin noodles)
--
--   5. lentils boiling 2.5 → 2.8
--      usda fdc #172420 cooked: 9.02 g protein/100 g
--      usda fdc #172421 raw:    25.8 g protein/100 g
--      factor = 25.8 / 9.02 = 2.86×; practical: 1 cup (192 g) dry → 2.5 cups (540 g) = 2.81×
--
--   6. soybeans boiling 2.5 → 2.2
--      usda fdc #174271 cooked: 16.6 g protein/100 g
--      usda fdc #174270 raw:    36.5 g protein/100 g
--      factor = 36.5 / 16.6 = 2.20× — soybeans absorb LESS water than other legumes
--      because their high protein and fat content limits starch swelling;
--      the original 2.5 is 14% too high
--
--   7. semolina boiling 3.0 → 3.4
--      usda fdc: semolina dry protein ~12 g/100 g; cooked porridge protein ~3.5 g/100 g
--      factor = 12 / 3.5 = 3.43×; practical: 100 g dry + 300 g water → ~370 g cooked = 3.70×
--      adopting 3.40 (conservative midpoint between protein ratio and practical cooking)

with corrections (product_name, method_slug, new_yield_factor) as (
  values

  -- cephalopods
  ('Octopus',      'boiling', 0.5000::numeric),

  -- asian noodles
  ('Egg noodles',  'boiling', 2.8000::numeric),
  ('Soba noodles', 'boiling', 2.9000::numeric),
  ('Udon noodles', 'boiling', 2.5000::numeric),

  -- legumes
  ('Lentils',      'boiling', 2.8000::numeric),
  ('Soybeans',     'boiling', 2.2000::numeric),

  -- grains
  ('Semolina',     'boiling', 3.4000::numeric)
)
update product_cooking_factors pcf
set    yield_factor = c.new_yield_factor
from   corrections c
join   products p
         on  p.name_en    = c.product_name
         and p.source     = 'system'
         and p.deleted_at is null
join   cooking_methods m
         on  m.slug = c.method_slug
where  pcf.product_id        = p.id
  and  pcf.cooking_method_id = m.id;
