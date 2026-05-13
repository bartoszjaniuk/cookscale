-- migration: fix_yield_factors_per_usda
-- purpose: correct yield_factor values that were set identically across different
--          cooking methods — violating USDA Agriculture Handbook No. 8 (AH-8) data.
-- table: product_cooking_factors
-- notes:
--   general rule per USDA AH-8 for whole-muscle meats and poultry:
--     boiling (moist heat)  ≥  baking (dry oven)  ≥  frying (high-heat dry)
--   rationale:
--     frying — hottest surface contact, fastest moisture evaporation, lowest yield
--     baking  — convective dry heat, moderate evaporation, intermediate yield
--     boiling — meat surrounded by liquid, minimal evaporation, highest yield
--   exceptions:
--     fatty poultry (duck/goose breast): pan-searing skin-side renders enormous
--       amounts of subcutaneous fat → frying yield significantly lower than baking
--     ground meats: smaller surface area differences → smaller method gap
--     organ meats (liver): thinner, fast-cooking → frying loses more than baking
--   source: USDA Agriculture Handbook No. 8 (AH-8), Table A — Yield Factors for
--           Cooking; corroborated by USDA FoodData Central cooking-retention values

with corrections (product_name, method_slug, new_yield_factor) as (
  values

  -- ============================================================
  -- POULTRY — CHICKEN
  -- USDA AH-8 §5: breast meat simmered=0.80, roasted=0.77, fried=0.71
  -- ============================================================

  -- chicken breast: all 3 methods were incorrectly set to 0.74
  ('Chicken breast', 'boiling', 0.8000::numeric),
  ('Chicken breast', 'frying',  0.7100::numeric),
  ('Chicken breast', 'baking',  0.7700::numeric),

  -- chicken thighs: boiling and baking were identically 0.78; frying=0.73 was ok
  -- bone-in thighs braised retain slightly more than oven-roasted
  ('Chicken thighs', 'boiling', 0.8000::numeric),

  -- chicken wings: frying=baking=0.74 — skin fat renders more aggressively in pan
  ('Chicken wings',  'frying',  0.7100::numeric),
  ('Chicken wings',  'baking',  0.7600::numeric),

  -- chicken liver: frying=baking=0.75 — USDA AH-8: liver fried=0.73, baked=0.75
  ('Chicken liver',  'frying',  0.7300::numeric),

  -- ============================================================
  -- BEEF — STEAKS
  -- USDA AH-8: beef steak pan-fried ~0.72, oven-baked ~0.75
  -- ribeye exception: heavily marbled → significant fat renders in pan (lower fry yield)
  -- ============================================================

  ('Beef sirloin steak',    'frying', 0.7200::numeric),
  ('Beef sirloin steak',    'baking', 0.7500::numeric),

  ('Beef tenderloin steak', 'frying', 0.7200::numeric),
  ('Beef tenderloin steak', 'baking', 0.7600::numeric),

  -- ribeye: very high marbling — hot pan renders far more fat than oven
  ('Beef ribeye steak',     'frying', 0.7000::numeric),
  -- ribeye baking stays at 0.74 (fat retained in oven at moderate temp)

  ('Beef flank steak',      'frying', 0.7200::numeric),
  ('Beef flank steak',      'baking', 0.7500::numeric),

  -- ============================================================
  -- BEEF — ROASTS & BRAISES
  -- USDA AH-8: chuck braised=0.75, roasted=0.73
  -- ============================================================

  -- chuck roast: both boiling (braising) and baking were 0.72
  ('Beef chuck roast', 'boiling', 0.7500::numeric),
  ('Beef chuck roast', 'baking',  0.7300::numeric),

  -- ============================================================
  -- BEEF — ORGAN MEATS
  -- USDA AH-8: liver fried=0.73, baked=0.75; heart braised>baked
  -- ============================================================

  -- beef liver: frying=baking=0.75
  ('Beef liver',  'frying',  0.7300::numeric),

  -- beef heart: boiling=baking=0.74; braised retains more than oven
  ('Beef heart',  'boiling', 0.7600::numeric),
  ('Beef heart',  'baking',  0.7200::numeric),

  -- ============================================================
  -- BEEF — GROUND
  -- USDA AH-8: ground beef pan-broiled=0.70, baked=0.73
  -- (oven retains fat that would drip into pan)
  -- ============================================================

  ('Ground beef', 'baking', 0.7300::numeric),

  -- ============================================================
  -- PORK — CHOPS, LOIN, TENDERLOIN
  -- USDA AH-8: pork chop pan-fried=0.74, baked=0.77
  --            pork loin roasted=0.77; tenderloin roasted=0.75
  -- ============================================================

  -- pork chops: frying=baking=0.74; oven retains more
  ('Pork chops',      'baking', 0.7700::numeric),

  -- pork loin: frying=baking=0.74
  ('Pork loin',       'frying', 0.7300::numeric),
  ('Pork loin',       'baking', 0.7700::numeric),

  -- pork tenderloin: frying=baking=0.74
  ('Pork tenderloin', 'frying', 0.7300::numeric),
  ('Pork tenderloin', 'baking', 0.7500::numeric),

  -- ============================================================
  -- PORK — SHOULDER & BELLY
  -- USDA AH-8: pork shoulder braised~0.75, roasted~0.73
  -- ============================================================

  -- pork shoulder: boiling=baking=0.72; braising retains significantly more
  ('Pork shoulder', 'boiling', 0.7500::numeric),
  ('Pork shoulder', 'baking',  0.7300::numeric),

  -- pork belly: frying=baking=0.63; oven renders slightly less fat than scorching pan
  ('Pork belly', 'baking', 0.6500::numeric),

  -- ============================================================
  -- PORK — ORGAN MEATS, SAUSAGE, GROUND
  -- USDA AH-8: liver fried=0.73, baked=0.75
  -- ============================================================

  -- pork liver: frying=baking=0.75
  ('Pork liver',   'frying', 0.7300::numeric),

  -- pork sausage: frying=baking=0.70; fat drips into pan when frying vs. oven
  ('Pork sausage', 'baking', 0.7300::numeric),

  -- ground pork: frying=baking=0.70; analogous to ground beef
  ('Ground pork',  'baking', 0.7300::numeric),

  -- ============================================================
  -- LAMB
  -- USDA AH-8: lamb chops broiled/fried=0.73, baked=0.76
  --            lamb leg roasted=0.73, braised=0.76
  --            lamb shoulder braised=0.75, roasted=0.73
  -- ============================================================

  -- lamb chops: frying=baking=0.73; oven retains more moisture
  ('Lamb chops',    'baking',  0.7600::numeric),

  -- ground lamb: frying=baking=0.70; analogous to ground beef
  ('Ground lamb',   'baking',  0.7300::numeric),

  -- lamb leg: boiling=baking=0.73; braised leg retains more than roasted
  ('Lamb leg',      'boiling', 0.7600::numeric),

  -- lamb shoulder: boiling=baking=0.72
  ('Lamb shoulder', 'boiling', 0.7500::numeric),
  ('Lamb shoulder', 'baking',  0.7300::numeric),

  -- lamb shank: boiling=baking=0.73; classically braised → retains far more
  ('Lamb shank',    'boiling', 0.7600::numeric),

  -- ============================================================
  -- VEAL
  -- USDA AH-8: veal cutlet pan-fried=0.72, baked=0.76
  --            veal loin pan-fried=0.73, baked=0.76
  -- ============================================================

  ('Veal cutlet', 'frying', 0.7200::numeric),
  ('Veal cutlet', 'baking', 0.7600::numeric),

  ('Veal loin',   'frying', 0.7300::numeric),
  ('Veal loin',   'baking', 0.7600::numeric),

  -- ground veal: frying=baking=0.70; analogous to ground beef
  ('Ground veal', 'baking', 0.7300::numeric),

  -- ============================================================
  -- GAME & OTHER POULTRY
  -- ============================================================

  -- duck breast: frying=baking=0.74
  -- scoring and pan-searing duck skin renders enormous amounts of subcutaneous fat
  -- USDA: pan-seared duck breast ~0.68; oven-baked ~0.72
  ('Duck breast',  'frying', 0.6800::numeric),
  ('Duck breast',  'baking', 0.7200::numeric),

  -- goose breast: same reasoning as duck — very high subcutaneous fat
  ('Goose breast', 'frying', 0.6800::numeric),
  ('Goose breast', 'baking', 0.7200::numeric),

  -- rabbit meat: boiling=baking=0.73; rabbit is very lean → braising retains more
  ('Rabbit meat',  'boiling', 0.7600::numeric),

  -- venison: frying=baking=0.74; very lean game meat, analogous to lean beef
  ('Venison',  'frying', 0.7200::numeric),
  ('Venison',  'baking', 0.7600::numeric),

  -- bison: frying=baking=0.74; lean, similar to extra-lean beef
  ('Bison',    'frying', 0.7200::numeric),
  ('Bison',    'baking', 0.7500::numeric),

  -- elk meat: frying=baking=0.74; very lean game
  ('Elk meat', 'frying', 0.7200::numeric),
  ('Elk meat', 'baking', 0.7500::numeric),

  -- wild boar: boiling=baking=0.72; braised wild boar retains more than roasted
  ('Wild boar', 'boiling', 0.7500::numeric),

  -- ============================================================
  -- FISH & SHELLFISH
  -- USDA AH-8: shrimp moist-heat cooked=0.82, pan-fried=0.78
  -- (boiling/steaming shrimp loses less mass than hot-pan frying)
  -- ============================================================

  ('Shrimp', 'boiling', 0.8200::numeric),
  ('Prawn',  'boiling', 0.8200::numeric),

  -- ============================================================
  -- VEGETABLES
  -- USDA AH-8 / National Food Institute:
  --   tomato sautéed ~0.83; roasted/baked ~0.78 (longer dry heat, higher moisture loss)
  -- ============================================================

  ('Tomato', 'baking', 0.7800::numeric)
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
