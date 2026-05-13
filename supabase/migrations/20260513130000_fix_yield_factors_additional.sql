-- migration: fix_yield_factors_additional
-- purpose: second-pass corrections for yield_factor errors missed in the first pass
-- table: product_cooking_factors
-- notes:
--   errors fixed in this migration fall into four categories:
--
--   a) direction inversion: boiling < baking is physically impossible for poultry/meat
--      because boiling (moist heat) always retains ≥ mass vs. dry oven heat
--
--   b) same-value errors between cooking methods: different heat transfer modes always
--      produce measurably different yields; identical values are placeholders, not data
--
--   c) lean fish baking too high: USDA AH-8 shows baked lean fish ~0.80 (dry oven
--      exposes more surface area to desiccating heat than hot-pan frying with a
--      protective protein crust)
--
--   d) fatty fish frying too high: pan-frying fatty fish (salmon, mackerel, etc.)
--      causes subcutaneous and inter-muscular fat to render onto the pan surface;
--      baking retains this fat → frying yield < baking yield for fatty species
--
--   source: USDA Agriculture Handbook No. 8 (AH-8), Table A; USDA SR28;
--           USDA FoodData Central cooking-retention data

with corrections (product_name, method_slug, new_yield_factor) as (
  values

  -- ============================================================
  -- POULTRY — TURKEY
  -- ============================================================

  -- turkey breast boiling=0.72 < baking=0.75 is INVERTED — moist heat always retains more
  -- USDA AH-8: turkey breast simmered/poached ~0.82, oven-roasted ~0.74
  ('Turkey breast', 'boiling', 0.8200::numeric),
  ('Turkey breast', 'baking',  0.7400::numeric),

  -- ============================================================
  -- GROUND POULTRY — CHICKEN & TURKEY
  -- USDA AH-8: ground poultry pan-broiled ~0.71, oven baked ~0.74
  -- (oven retains fat that drips off into a skillet)
  -- ============================================================

  ('Ground chicken', 'frying', 0.7100::numeric),
  ('Ground chicken', 'baking', 0.7400::numeric),

  ('Ground turkey',  'frying', 0.7100::numeric),
  ('Ground turkey',  'baking', 0.7400::numeric),

  -- ============================================================
  -- BEEF — SINGLE-METHOD STEAKS
  -- these steaks were not corrected in the first pass because they have only
  -- one cooking method recorded; however their value (0.74) is inconsistent
  -- with the sirloin/tenderloin/flank corrections already applied (→0.72)
  -- USDA AH-8: lean beef steaks pan-broiled/pan-fried ~0.72
  -- T-bone and porterhouse contain a bone but the meat yield factor is still ~0.72
  -- skirt steak is a thin, very lean diaphragm muscle — high surface area → more evaporation
  -- ============================================================

  ('Beef T-bone steak',      'frying', 0.7200::numeric),
  ('Beef porterhouse steak', 'frying', 0.7200::numeric),
  ('Beef skirt steak',       'frying', 0.7200::numeric),

  -- ============================================================
  -- FISH — LEAN FINFISH: baking must be lower than frying
  -- USDA AH-8 reference point: cod baked=0.79, cod pan-fried=0.82
  -- mechanism: dry oven exposes the full surface to desiccating hot air;
  --             pan-frying forms a protein crust quickly, limiting moisture loss
  -- correction: lean fish baking 0.82 → 0.80 (conservative USDA midpoint)
  -- ============================================================

  ('Tuna',          'baking', 0.8000::numeric),
  ('Yellowfin tuna','baking', 0.8000::numeric),
  ('Bluefin tuna',  'baking', 0.8000::numeric),

  ('Cod',           'baking', 0.8000::numeric),
  ('Pacific cod',   'baking', 0.8000::numeric),
  ('Halibut',       'baking', 0.8000::numeric),
  ('Sole',          'baking', 0.8000::numeric),
  ('Tilapia',       'baking', 0.8000::numeric),
  ('Catfish',       'baking', 0.8000::numeric),
  ('Trout',         'baking', 0.8000::numeric),
  ('Rainbow trout', 'baking', 0.8000::numeric),
  ('Sea bass',      'baking', 0.8000::numeric),
  ('Snapper',       'baking', 0.8000::numeric),
  ('Grouper',       'baking', 0.8000::numeric),
  ('Mahi mahi',     'baking', 0.8000::numeric),
  ('Swordfish',     'baking', 0.8000::numeric),
  ('Turbot',        'baking', 0.8000::numeric),
  ('Carp',          'baking', 0.8000::numeric),

  -- ============================================================
  -- FISH — FATTY FINFISH: frying must be lower than baking
  -- mechanism: inter-muscular and subcutaneous fat (10-20% in salmon, mackerel,
  --             herring, eel) renders and spreads across the hot pan surface when
  --             frying; in the oven this fat is largely retained within the flesh
  -- USDA FoodData Central: salmon pan-fried ~0.80, salmon baked ~0.82
  -- correction: fatty fish frying 0.82 → 0.80 (baking stays at 0.82)
  -- ============================================================

  ('Salmon',          'frying', 0.8000::numeric),
  ('Atlantic salmon', 'frying', 0.8000::numeric),
  ('Sockeye salmon',  'frying', 0.8000::numeric),
  ('Mackerel',        'frying', 0.8000::numeric),
  ('Herring',         'frying', 0.8000::numeric),
  ('Eel',             'frying', 0.8000::numeric),
  -- eel baked also renders substantial fat at oven temperatures
  ('Eel',             'baking', 0.8200::numeric),  -- already 0.82 but confirming intentional

  -- ============================================================
  -- VEGETABLES — ONION
  -- frying (sautéing) onions causes extreme moisture loss through caramelisation
  -- USDA AH-8: sliced/diced onion sautéed ~0.68 (water releases as steam at high heat)
  -- roasted onion (halved, oven): ~0.83 — flesh is protected by outer layers
  -- current frying=0.82 is nearly identical to baking=0.83 which is physically wrong
  -- ============================================================

  ('Onion', 'frying', 0.6800::numeric),
  -- baking=0.83 is correct, no change needed

  -- ============================================================
  -- VEGETABLES — CARROT
  -- sautéed carrot (frying=0.88) is plausible for a quick stir-fry
  -- baked carrot in a dry oven at 200°C loses significantly more moisture
  -- USDA AH-8: carrots roasted ~0.80; boiled ~0.95 (already correct)
  -- current baking=0.88 is identical to frying — clearly a placeholder
  -- ============================================================

  ('Carrot', 'baking', 0.8000::numeric),

  -- ============================================================
  -- VEGETABLES — FENNEL
  -- fennel (frying=baking=0.85) — same-value placeholder error
  -- sautéed fennel: moderate moisture loss similar to celery ~0.83
  -- roasted/baked fennel at dry heat: additional evaporation ~0.80
  -- ============================================================

  ('Fennel', 'frying', 0.8300::numeric),
  ('Fennel', 'baking', 0.8000::numeric)
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
