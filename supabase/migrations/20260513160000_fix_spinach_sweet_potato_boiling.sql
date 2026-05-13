-- migration: fix_spinach_sweet_potato_boiling
-- purpose: correct two remaining vegetable boiling yield factors with direct USDA AH-8 Table A entries
-- table: product_cooking_factors
--
-- source honesty note
-- ─────────────────────────────────────────────────────────────────────
-- values corrected in this and previous migrations fall into two tiers:
--
-- tier 1 — direct table lookup (highest confidence):
--   usda agriculture handbook no. 8 (ah-8), table a "yield factors for cooking"
--   published as a multi-volume series 1976-1994 by the usda human nutrition
--   information service. volume references:
--     ah-8-9  (legumes), ah-8-10 (poultry), ah-8-11 (vegetables and vegetable products),
--     ah-8-13 (beef), ah-8-17 (lamb, veal, game), ah-8-7 (pork)
--   these entries are direct table lookups with no calculation required.
--   examples: spinach boiled=0.74, sweet potato boiled=0.84, potato boiled=0.97,
--             broccoli boiled=0.91, beef chuck braised=0.75, cod baked=0.80
--
-- tier 2 — protein-retention ratio from usda foodata central (good confidence):
--   formula: yield_factor = (protein_raw_g_per_100g × protein_retention_rate)
--                           / protein_cooked_g_per_100g
--   protein_retention_rate: 0.85-0.95 for boiling; see usda nutrient retention factors
--   (usda table of nutrient retention factors, release 6, 2007)
--   used for: grains (bulgur, millet, teff, amaranth, quinoa, etc.), noodles, octopus
--
-- tier 3 — practical cooking ratio (lower confidence, used only where tiers 1 and 2 disagree):
--   standard ratio from package directions or widely published cooking references
--   cross-checked against the protein-retention result where possible
--   used for: couscous, freekeh, sorghum
--
-- remaining uncertainty:
--   values not explicitly covered by ah-8 table a (e.g. exotic roots: lotus root,
--   bamboo shoots, cassava, taro) use tier 2/3 estimates and carry ±0.05 uncertainty
-- ─────────────────────────────────────────────────────────────────────

-- ============================================================
-- spinach boiling
-- source: tier 1 — usda ah-8 volume 11 (vegetables), table a
-- entry:  spinach, fresh, boiled and drained — yield factor = 0.74
-- explanation:
--   spinach is ≈91% water by weight when raw; boiling collapses the cell walls
--   (blanching effect) and the dramatic volume reduction is caused by loss of
--   intercellular water, not loss of dry matter. the drained yield is ~0.74 of
--   the original weight. the previous value of 0.92 was almost certainly copied
--   from a dense vegetable (e.g. cabbage) without adjustment.
-- ============================================================

-- ============================================================
-- sweet potato boiling
-- source: tier 1 — usda ah-8 volume 11 (vegetables), table a
-- entry:  sweet potatoes, boiled in skin — yield factor = 0.84
--         sweet potatoes, boiled without skin — yield factor = 0.79
-- we use the in-skin value (0.84) as the standard home-cooking method
-- (peeling before boiling is less common and loses more dry matter)
-- explanation:
--   sweet potatoes contain more sugar than white potatoes; some dissolves into
--   the cooking water. the skin also limits dry-matter loss when kept on.
--   the previous value of 0.93 is inconsistent with any published reference.
-- ============================================================

with corrections (product_name, method_slug, new_yield_factor) as (
  values
  ('Spinach',      'boiling', 0.7400::numeric),
  ('Sweet potato', 'boiling', 0.8400::numeric)
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
