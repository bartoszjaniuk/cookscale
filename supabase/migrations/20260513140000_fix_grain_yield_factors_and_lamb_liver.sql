-- migration: fix_grain_yield_factors_and_lamb_liver
-- purpose: correct two categories of errors remaining after the first two fix migrations
-- table: product_cooking_factors
--
-- category a — grain absorption factors (boiling yield_factor > 1.0)
--   many grains were set to 2.0 as a placeholder, which is significantly too low.
--   verification method: usda foodata central protein retention ratio
--     factor = protein_per_100g_dry / protein_per_100g_cooked
--   this ratio removes the effect of moisture and gives the true mass multiplication.
--   source: usda foodata central (fdc.nal.usda.gov) nutrient data; usda sr28
--
-- category b — lamb liver frying consistency
--   beef liver, pork liver, and chicken liver were all corrected from 0.75 → 0.73 in
--   migration 20260513120000. lamb liver (frying=0.75) was the only liver missed.
--   lamb liver is physiologically identical to other liver types in cooking behaviour.

with corrections (product_name, method_slug, new_yield_factor) as (
  values

  -- ============================================================
  -- GRAINS — corrected absorption factors
  -- verification: usda fdc protein ratio (dry_protein / cooked_protein)
  -- ============================================================

  -- bulgur:
  --   usda fdc #170285 cooked: protein 3.08 g/100g
  --   usda fdc #20014   dry:   protein 12.3 g/100g
  --   protein ratio: 12.3 / 3.08 = 3.99x
  --   conservative value (some water lost to steam during cooking): 3.50
  ('Bulgur', 'boiling', 3.5000::numeric),

  -- couscous:
  --   usda fdc cooked: protein ~3.8 g/100g
  --   usda fdc dry:    protein 12.8 g/100g
  --   protein ratio: ~3.4x; practical absorption (1:1.5 water ratio): ~2.5x
  --   using practical value as couscous is typically soaked/steamed, not boiled long
  ('Couscous', 'boiling', 2.5000::numeric),

  -- farro (emmer wheat):
  --   usda fdc cooked: protein ~5.5 g/100g (hard kernel, less starch exposed)
  --   usda fdc dry:    protein 14.5 g/100g
  --   protein ratio: ~2.6x; hard whole grain absorbs less than cracked grains
  ('Farro', 'boiling', 2.6000::numeric),

  -- freekeh (cracked green durum wheat):
  --   similar to bulgur in structure (cracked, parboiled) but greener/less processed
  --   usda data for cracked green wheat suggests ~2.5-3.0x absorption
  --   conservative midpoint: 2.50
  ('Freekeh', 'boiling', 2.5000::numeric),

  -- millet:
  --   usda fdc #168871 cooked: protein 3.51 g/100g
  --   usda fdc #169702 raw:    protein 11.0 g/100g
  --   protein ratio: 11.0 / 3.51 = 3.13x → round to 3.00
  ('Millet', 'boiling', 3.0000::numeric),

  -- teff:
  --   usda fdc cooked: protein 3.99 g/100g
  --   usda fdc raw:    protein 13.3 g/100g
  --   protein ratio: 13.3 / 3.99 = 3.33x
  ('Teff', 'boiling', 3.3000::numeric),

  -- sorghum:
  --   usda fdc cooked: protein ~2.3 g/100g
  --   usda fdc raw:    protein 11.3 g/100g
  --   protein ratio: ~4.9x (unusually high; whole sorghum is very hard)
  --   standard cooking: 1 cup (192g) + 3 cups water → ~3 cups cooked (~490g); factor ~2.5x
  --   using practical cooking ratio as the more reliable reference for hard whole sorghum
  ('Sorghum', 'boiling', 2.5000::numeric),

  -- quinoa (all varieties share the same starch/protein structure):
  --   usda fdc #168917 raw:    protein 14.1 g/100g
  --   usda fdc #2018551 cooked: protein 4.40 g/100g
  --   protein ratio: 14.1 / 4.40 = 3.20x → round to 3.00
  --   corroborated by: 1 cup (185g) dry + 2 cups water → ~3 cups (555g); factor 555/185 = 3.00
  ('Quinoa',       'boiling', 3.0000::numeric),
  ('White quinoa', 'boiling', 3.0000::numeric),
  ('Red quinoa',   'boiling', 3.0000::numeric),

  -- amaranth:
  --   usda fdc #170683 raw:    protein 13.6 g/100g
  --   usda fdc #170284 cooked: protein 3.80 g/100g
  --   protein ratio: 13.6 / 3.80 = 3.58x → round to 3.50
  ('Amaranth', 'boiling', 3.5000::numeric),

  -- ============================================================
  -- MEAT — LAMB LIVER (consistency fix)
  -- all other liver types corrected to 0.73 in migration 20260513120000;
  -- lamb liver (frying=0.75) was inadvertently omitted
  -- usda ah-8: liver pan-fried = 0.73 regardless of animal species
  -- ============================================================

  ('Lamb liver', 'frying', 0.7300::numeric)
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
