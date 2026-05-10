-- migration: seed_product_cooking_factors
-- purpose: populate product_cooking_factors with USDA-based yield factors for all cookable system products
-- table: product_cooking_factors
-- notes:
--   yield_factor = cooked_weight / raw_weight
--     < 1.0  — product loses mass (water evaporation, fat rendering) — meat, fish, most vegetables
--     > 1.0  — product gains mass (water absorption)                 — raw grains, dried legumes, pasta
--
--   source: USDA Agriculture Handbook 8, USDA Table A (Yield Factors), and USDA FoodData Central
--   cooking method slugs: 'boiling', 'frying', 'baking'
--   missing row = method unavailable for that product (ui filters available methods)
--
--   categories covered: meat, fish, vegetables, grains (pasta/rice/cereals), legumes
--   dairy excluded: dairy products are not typically raw-cooked in ways that change weight
--   processed meats excluded (ham, bacon, salami, etc.): already cured/cooked at purchase

with factors (product_name, method_slug, yield_factor) as (
  values

  -- ============================================================
  -- MEAT: POULTRY — CHICKEN
  -- source: USDA AH-8, Table A
  -- ============================================================

  -- whole chicken: typically oven-roasted; boiling for stock is not weight-measured raw→cooked
  ('Whole chicken',      'baking',   0.7800::numeric),

  -- chicken breast: all 3 methods applicable, loss from moisture release
  ('Chicken breast',    'boiling',  0.7400::numeric),
  ('Chicken breast',    'frying',   0.7400::numeric),
  ('Chicken breast',    'baking',   0.7400::numeric),

  -- chicken thighs: bone-in, more fat, less moisture loss
  ('Chicken thighs',   'boiling',  0.7800::numeric),
  ('Chicken thighs',   'frying',   0.7300::numeric),
  ('Chicken thighs',   'baking',   0.7800::numeric),

  -- chicken drumsticks
  ('Chicken drumsticks', 'boiling', 0.7900::numeric),
  ('Chicken drumsticks', 'frying',  0.7300::numeric),
  ('Chicken drumsticks', 'baking',  0.7600::numeric),

  -- chicken wings
  ('Chicken wings',    'frying',   0.7400::numeric),
  ('Chicken wings',    'baking',   0.7400::numeric),

  -- ground chicken: pan-fry or bake; not boiled
  ('Ground chicken',   'frying',   0.7200::numeric),
  ('Ground chicken',   'baking',   0.7200::numeric),

  -- chicken liver: quick pan-fry or bake
  ('Chicken liver',    'frying',   0.7500::numeric),
  ('Chicken liver',    'baking',   0.7500::numeric),

  -- chicken gizzards: typically boiled/braised
  ('Chicken gizzards', 'boiling',  0.7400::numeric),

  -- ============================================================
  -- MEAT: POULTRY — TURKEY
  -- ============================================================

  ('Whole turkey',     'baking',   0.7800::numeric),
  ('Turkey breast',    'boiling',  0.7200::numeric),
  ('Turkey breast',    'baking',   0.7500::numeric),
  ('Turkey thighs',   'boiling',  0.7800::numeric),
  ('Turkey thighs',   'baking',   0.7600::numeric),
  ('Turkey wings',    'baking',   0.7400::numeric),
  ('Ground turkey',   'frying',   0.7200::numeric),
  ('Ground turkey',   'baking',   0.7200::numeric),

  -- ============================================================
  -- MEAT: BEEF
  -- source: USDA AH-8, Table A
  -- ============================================================

  -- ground beef: loses fat and water when cooked; boiling not standard
  ('Ground beef',           'frying',  0.7000::numeric),
  ('Ground beef',           'baking',  0.7000::numeric),

  -- steaks: pan-sear (frying) or oven; not boiled
  ('Beef sirloin steak',    'frying',  0.7400::numeric),
  ('Beef sirloin steak',    'baking',  0.7400::numeric),
  ('Beef tenderloin steak', 'frying',  0.7400::numeric),
  ('Beef tenderloin steak', 'baking',  0.7400::numeric),
  ('Beef ribeye steak',     'frying',  0.7400::numeric),
  ('Beef ribeye steak',     'baking',  0.7400::numeric),
  ('Beef T-bone steak',     'frying',  0.7400::numeric),
  ('Beef porterhouse steak','frying',  0.7400::numeric),
  ('Beef flank steak',      'frying',  0.7400::numeric),
  ('Beef flank steak',      'baking',  0.7400::numeric),
  ('Beef skirt steak',      'frying',  0.7400::numeric),

  -- roasts and braises: boiling (pot roast / braising liquid) and baking
  ('Beef chuck roast',  'boiling',  0.7200::numeric),
  ('Beef chuck roast',  'baking',   0.7200::numeric),
  ('Beef brisket',      'boiling',  0.7600::numeric),
  ('Beef brisket',      'baking',   0.7300::numeric),
  ('Beef short ribs',   'boiling',  0.7600::numeric),
  ('Beef short ribs',   'baking',   0.7400::numeric),
  ('Beef shank',        'boiling',  0.7000::numeric),

  -- organ meats
  ('Beef liver',        'frying',   0.7500::numeric),
  ('Beef liver',        'baking',   0.7500::numeric),
  ('Beef heart',        'boiling',  0.7400::numeric),
  ('Beef heart',        'baking',   0.7400::numeric),
  ('Beef tongue',       'boiling',  0.7000::numeric),

  -- ============================================================
  -- MEAT: PORK
  -- ============================================================

  -- chops and loin: fry or bake
  ('Pork chops',       'frying',  0.7400::numeric),
  ('Pork chops',       'baking',  0.7400::numeric),
  ('Pork loin',        'frying',  0.7400::numeric),
  ('Pork loin',        'baking',  0.7400::numeric),
  ('Pork tenderloin',  'frying',  0.7400::numeric),
  ('Pork tenderloin',  'baking',  0.7400::numeric),

  -- shoulder: slow-cooked — boiling (braise) or baking
  ('Pork shoulder',    'boiling', 0.7200::numeric),
  ('Pork shoulder',    'baking',  0.7200::numeric),

  -- ribs: boiling to par-cook then bake/grill
  ('Pork ribs',        'boiling', 0.7600::numeric),
  ('Pork ribs',        'baking',  0.7400::numeric),

  -- ground pork: pan-fry or bake; not boiled
  ('Ground pork',      'frying',  0.7000::numeric),
  ('Ground pork',      'baking',  0.7000::numeric),

  -- pork belly: significant fat rendering; high moisture loss
  ('Pork belly',       'frying',  0.6300::numeric),
  ('Pork belly',       'baking',  0.6300::numeric),

  -- organ meats
  ('Pork liver',       'frying',  0.7500::numeric),
  ('Pork liver',       'baking',  0.7500::numeric),

  -- sausages (raw pork sausage, not cured)
  ('Pork sausage',     'frying',  0.7000::numeric),
  ('Pork sausage',     'baking',  0.7000::numeric),

  -- ============================================================
  -- MEAT: LAMB
  -- ============================================================

  ('Lamb chops',       'frying',  0.7300::numeric),
  ('Lamb chops',       'baking',  0.7300::numeric),
  ('Ground lamb',      'frying',  0.7000::numeric),
  ('Ground lamb',      'baking',  0.7000::numeric),
  ('Lamb leg',         'boiling', 0.7300::numeric),
  ('Lamb leg',         'baking',  0.7300::numeric),
  ('Lamb shoulder',    'boiling', 0.7200::numeric),
  ('Lamb shoulder',    'baking',  0.7200::numeric),
  ('Lamb shank',       'boiling', 0.7300::numeric),
  ('Lamb shank',       'baking',  0.7300::numeric),
  ('Rack of lamb',     'baking',  0.7300::numeric),
  ('Lamb liver',       'frying',  0.7500::numeric),

  -- ============================================================
  -- MEAT: VEAL
  -- ============================================================

  ('Veal cutlet',  'frying',  0.7400::numeric),
  ('Veal cutlet',  'baking',  0.7400::numeric),
  ('Veal loin',    'frying',  0.7400::numeric),
  ('Veal loin',    'baking',  0.7400::numeric),
  ('Veal shank',   'boiling', 0.7000::numeric),
  ('Ground veal',  'frying',  0.7000::numeric),
  ('Ground veal',  'baking',  0.7000::numeric),

  -- ============================================================
  -- MEAT: GAME & OTHER POULTRY
  -- ============================================================

  ('Whole duck',    'baking',  0.7500::numeric),
  ('Duck breast',   'frying',  0.7400::numeric),
  ('Duck breast',   'baking',  0.7400::numeric),
  ('Duck legs',     'boiling', 0.7600::numeric),
  ('Duck legs',     'baking',  0.7400::numeric),
  ('Goose',         'baking',  0.7500::numeric),
  ('Goose breast',  'frying',  0.7400::numeric),
  ('Goose breast',  'baking',  0.7400::numeric),
  ('Rabbit meat',   'boiling', 0.7300::numeric),
  ('Rabbit meat',   'baking',  0.7300::numeric),
  ('Venison',       'frying',  0.7400::numeric),
  ('Venison',       'baking',  0.7400::numeric),
  ('Bison',         'frying',  0.7400::numeric),
  ('Bison',         'baking',  0.7400::numeric),
  ('Elk meat',      'frying',  0.7400::numeric),
  ('Elk meat',      'baking',  0.7400::numeric),
  ('Wild boar',     'boiling', 0.7200::numeric),
  ('Wild boar',     'baking',  0.7200::numeric),

  -- ============================================================
  -- FISH: FINFISH
  -- source: USDA AH-8 yield factors for fish (raw → cooked)
  -- lean fish boiling:  ~0.84 (cod, halibut, sole, tilapia, sea bass, snapper, grouper, perch, pike)
  -- fatty fish boiling: ~0.80 (salmon, mackerel, herring, eel — fat rendering adds to moisture loss)
  -- frying:   ~0.82 (more moisture loss, some oil gain in coating)
  -- baking:   ~0.82 (similar to frying, dry heat)
  -- ============================================================

  ('Salmon',           'boiling', 0.8000::numeric),  -- fatty fish: fat rendering lowers yield vs lean fish
  ('Salmon',           'frying',  0.8200::numeric),
  ('Salmon',           'baking',  0.8200::numeric),

  ('Atlantic salmon',  'boiling', 0.8000::numeric),  -- fatty fish: ~20% fat content
  ('Atlantic salmon',  'frying',  0.8200::numeric),
  ('Atlantic salmon',  'baking',  0.8200::numeric),

  ('Sockeye salmon',   'boiling', 0.8000::numeric),  -- fatty fish: ~10-12% fat content
  ('Sockeye salmon',   'frying',  0.8200::numeric),
  ('Sockeye salmon',   'baking',  0.8200::numeric),

  ('Tuna',             'boiling', 0.8400::numeric),
  ('Tuna',             'frying',  0.8200::numeric),
  ('Tuna',             'baking',  0.8200::numeric),

  ('Yellowfin tuna',   'boiling', 0.8400::numeric),
  ('Yellowfin tuna',   'frying',  0.8200::numeric),
  ('Yellowfin tuna',   'baking',  0.8200::numeric),

  ('Bluefin tuna',     'boiling', 0.8400::numeric),
  ('Bluefin tuna',     'frying',  0.8200::numeric),
  ('Bluefin tuna',     'baking',  0.8200::numeric),

  ('Cod',              'boiling', 0.8400::numeric),
  ('Cod',              'frying',  0.8200::numeric),
  ('Cod',              'baking',  0.8200::numeric),

  ('Pacific cod',      'boiling', 0.8400::numeric),
  ('Pacific cod',      'frying',  0.8200::numeric),
  ('Pacific cod',      'baking',  0.8200::numeric),

  ('Halibut',          'boiling', 0.8400::numeric),
  ('Halibut',          'frying',  0.8200::numeric),
  ('Halibut',          'baking',  0.8200::numeric),

  -- sole: delicate, rarely boiled
  ('Sole',             'frying',  0.8200::numeric),
  ('Sole',             'baking',  0.8200::numeric),

  ('Tilapia',          'boiling', 0.8400::numeric),
  ('Tilapia',          'frying',  0.8200::numeric),
  ('Tilapia',          'baking',  0.8200::numeric),

  ('Catfish',          'boiling', 0.8400::numeric),
  ('Catfish',          'frying',  0.8200::numeric),
  ('Catfish',          'baking',  0.8200::numeric),

  ('Mackerel',         'boiling', 0.8000::numeric),  -- fatty fish: ~15% fat content
  ('Mackerel',         'frying',  0.8200::numeric),
  ('Mackerel',         'baking',  0.8200::numeric),

  -- herring: typically fried or pickled; baking less common
  ('Herring',          'boiling', 0.8000::numeric),  -- fatty fish: ~15-18% fat content
  ('Herring',          'frying',  0.8200::numeric),

  ('Trout',            'boiling', 0.8400::numeric),
  ('Trout',            'frying',  0.8200::numeric),
  ('Trout',            'baking',  0.8200::numeric),

  ('Rainbow trout',    'boiling', 0.8400::numeric),
  ('Rainbow trout',    'frying',  0.8200::numeric),
  ('Rainbow trout',    'baking',  0.8200::numeric),

  ('Sea bass',         'boiling', 0.8400::numeric),
  ('Sea bass',         'frying',  0.8200::numeric),
  ('Sea bass',         'baking',  0.8200::numeric),

  ('Snapper',          'boiling', 0.8400::numeric),
  ('Snapper',          'frying',  0.8200::numeric),
  ('Snapper',          'baking',  0.8200::numeric),

  ('Grouper',          'boiling', 0.8400::numeric),
  ('Grouper',          'frying',  0.8200::numeric),
  ('Grouper',          'baking',  0.8200::numeric),

  ('Mahi mahi',        'boiling', 0.8400::numeric),
  ('Mahi mahi',        'frying',  0.8200::numeric),
  ('Mahi mahi',        'baking',  0.8200::numeric),

  -- swordfish: steaks; baking and frying
  ('Swordfish',        'frying',  0.8200::numeric),
  ('Swordfish',        'baking',  0.8200::numeric),

  ('Turbot',           'boiling', 0.8400::numeric),
  ('Turbot',           'frying',  0.8200::numeric),
  ('Turbot',           'baking',  0.8200::numeric),

  ('Eel',              'boiling', 0.8000::numeric),  -- fatty fish: ~20% fat content
  ('Eel',              'frying',  0.8200::numeric),
  ('Eel',              'baking',  0.8200::numeric),

  ('Carp',             'boiling', 0.8400::numeric),
  ('Carp',             'frying',  0.8200::numeric),
  ('Carp',             'baking',  0.8200::numeric),

  ('Pike',             'boiling', 0.8400::numeric),
  ('Pike',             'frying',  0.8200::numeric),

  ('Perch',            'boiling', 0.8400::numeric),
  ('Perch',            'frying',  0.8200::numeric),

  -- ============================================================
  -- FISH: SHELLFISH & SEAFOOD
  -- shellfish shrinks significantly when boiled — loses water/protein
  -- boiling: ~0.78-0.84  |  frying: ~0.78-0.80
  -- ============================================================

  -- shrimp/prawn: all 3 methods; high moisture loss
  ('Shrimp',       'boiling', 0.7800::numeric),
  ('Shrimp',       'frying',  0.7800::numeric),
  ('Prawn',        'boiling', 0.7800::numeric),
  ('Prawn',        'frying',  0.7800::numeric),

  -- crab/lobster/crayfish: typically boiled or steamed
  ('Crab',         'boiling', 0.7900::numeric),
  ('Lobster',      'boiling', 0.7900::numeric),
  ('Crayfish',     'boiling', 0.7900::numeric),

  -- bivalves: boiling/steaming is standard
  ('Mussels',      'boiling', 0.7900::numeric),
  ('Clams',        'boiling', 0.7900::numeric),
  ('Oysters',      'boiling', 0.7900::numeric),
  ('Scallops',     'boiling', 0.7900::numeric),
  ('Scallops',     'frying',  0.7800::numeric),

  -- cephalopods: boiling or frying; significant shrinkage
  ('Squid',        'boiling', 0.8000::numeric),
  ('Squid',        'frying',  0.7800::numeric),
  ('Octopus',      'boiling', 0.7500::numeric),
  ('Cuttlefish',   'boiling', 0.8000::numeric),
  ('Cuttlefish',   'frying',  0.7800::numeric),

  -- mixed seafood
  ('Mixed seafood','boiling', 0.8000::numeric),
  ('Mixed seafood','frying',  0.7800::numeric),

  -- ============================================================
  -- VEGETABLES
  -- source: USDA AH-8, National Food Institute, published cooking studies
  -- boiling: vegetables soften and release water but remain mostly intact
  -- frying (sauté/stir-fry): higher heat → more evaporation
  -- baking: dry heat → significant moisture loss
  -- ============================================================

  -- broccoli: all 3 methods
  ('Broccoli',    'boiling', 0.9100::numeric),
  ('Broccoli',    'frying',  0.8700::numeric),
  ('Broccoli',    'baking',  0.8600::numeric),

  -- carrot: retains moisture well, especially when boiled
  ('Carrot',      'boiling', 0.9500::numeric),
  ('Carrot',      'frying',  0.8800::numeric),
  ('Carrot',      'baking',  0.8800::numeric),

  -- spinach: dramatic shrinkage when cooked (wilts heavily)
  ('Spinach',     'boiling', 0.9200::numeric),
  ('Spinach',     'frying',  0.6800::numeric),

  -- tomato: best roasted or sautéed; rarely boiled alone
  ('Tomato',      'frying',  0.8300::numeric),
  ('Tomato',      'baking',  0.8300::numeric),

  -- asparagus
  ('Asparagus',   'boiling', 0.9100::numeric),
  ('Asparagus',   'frying',  0.8700::numeric),
  ('Asparagus',   'baking',  0.8200::numeric),

  -- cabbage: boiling or sauté; rarely baked
  ('Cabbage',     'boiling', 0.9200::numeric),
  ('Cabbage',     'frying',  0.8500::numeric),

  -- zucchini: all 3; significant moisture loss when baked or fried
  ('Zucchini',    'boiling', 0.9200::numeric),
  ('Zucchini',    'frying',  0.8300::numeric),
  ('Zucchini',    'baking',  0.8000::numeric),

  -- potato: USDA data — boiling retains mass, baking loses significant moisture
  ('Potato',      'boiling', 0.9700::numeric),
  ('Potato',      'frying',  0.6300::numeric),
  ('Potato',      'baking',  0.7700::numeric),

  -- mushroom: extreme moisture loss especially when fried/sautéed
  ('Mushroom',    'frying',  0.6500::numeric),
  ('Mushroom',    'baking',  0.6800::numeric),

  -- cauliflower
  ('Cauliflower', 'boiling', 0.9200::numeric),
  ('Cauliflower', 'frying',  0.8700::numeric),
  ('Cauliflower', 'baking',  0.8500::numeric),

  -- eggplant: significant oil absorption when fried offsets moisture loss; net yield ~0.85
  --           baking = pure moisture loss, no oil uptake
  ('Eggplant',    'frying',  0.8500::numeric),
  ('Eggplant',    'baking',  0.7700::numeric),

  -- kale: boiling or sauté; not typically baked as a standalone
  ('Kale',        'boiling', 0.9100::numeric),
  ('Kale',        'frying',  0.7500::numeric),

  -- beetroot: boiling (with skin) retains well; baking loses more
  ('Beetroot',    'boiling', 0.9300::numeric),
  ('Beetroot',    'baking',  0.8100::numeric),

  -- turnip
  ('Turnip',      'boiling', 0.9200::numeric),
  ('Turnip',      'baking',  0.8500::numeric),

  -- sweet potato: all 3; frying loses more moisture
  ('Sweet potato','boiling', 0.9300::numeric),
  ('Sweet potato','frying',  0.7800::numeric),
  ('Sweet potato','baking',  0.8500::numeric),

  -- pumpkin: boiling or baking
  ('Pumpkin',     'boiling', 0.9300::numeric),
  ('Pumpkin',     'baking',  0.8300::numeric),

  -- butternut squash
  ('Butternut squash','boiling', 0.9300::numeric),
  ('Butternut squash','baking',  0.8300::numeric),

  -- other squash varieties
  ('Spaghetti squash','boiling', 0.9300::numeric),
  ('Spaghetti squash','baking',  0.8300::numeric),
  ('Acorn squash',  'boiling', 0.9300::numeric),
  ('Acorn squash',  'baking',  0.8300::numeric),

  -- leek: boiling or sauté
  ('Leek',        'boiling', 0.9200::numeric),
  ('Leek',        'frying',  0.8700::numeric),

  -- green beans: boiling or stir-fry
  ('Green beans', 'boiling', 0.9200::numeric),
  ('Green beans', 'frying',  0.8200::numeric),

  -- brussels sprouts: all 3 methods
  ('Brussels sprouts','boiling', 0.9100::numeric),
  ('Brussels sprouts','frying',  0.8500::numeric),
  ('Brussels sprouts','baking',  0.8300::numeric),

  -- onion: sauté or roast; rarely boiled alone
  ('Onion',       'frying',  0.8200::numeric),
  ('Onion',       'baking',  0.8300::numeric),

  -- bell pepper: sauté or roast
  ('Bell pepper', 'frying',  0.8200::numeric),
  ('Bell pepper', 'baking',  0.8000::numeric),

  -- celery: boiling (soups) or sauté
  ('Celery',      'boiling', 0.9200::numeric),
  ('Celery',      'frying',  0.8500::numeric),

  -- fennel: all 3
  ('Fennel',      'boiling', 0.9200::numeric),
  ('Fennel',      'frying',  0.8500::numeric),
  ('Fennel',      'baking',  0.8500::numeric),

  -- parsnip: boiling or baking
  ('Parsnip',     'boiling', 0.9200::numeric),
  ('Parsnip',     'baking',  0.8200::numeric),

  -- peas (fresh/green): boiling only; often blanched
  ('Peas',        'boiling', 0.9600::numeric),

  -- corn (fresh): boiling or baking
  ('Corn',        'boiling', 0.9500::numeric),
  ('Corn',        'frying',  0.8900::numeric),
  ('Corn',        'baking',  0.8600::numeric),

  -- snap peas and snow peas: quick boiling or stir-fry; retain structure
  ('Snap peas',   'boiling', 0.9200::numeric),
  ('Snap peas',   'frying',  0.8800::numeric),
  ('Snow peas',   'boiling', 0.9200::numeric),
  ('Snow peas',   'frying',  0.8800::numeric),

  -- artichoke: boiling is the primary method
  ('Artichoke',   'boiling', 0.7800::numeric),  -- whole artichoke; USDA AH-8: ~22% loss from outer leaves + water

  -- okra: boiling or frying
  ('Okra',        'boiling', 0.9200::numeric),
  ('Okra',        'frying',  0.8200::numeric),

  -- leafy greens: boiling or sauté; significant wilting
  ('Swiss chard',    'boiling', 0.9200::numeric),
  ('Swiss chard',    'frying',  0.7500::numeric),
  ('Collard greens', 'boiling', 0.9200::numeric),
  ('Mustard greens', 'boiling', 0.9200::numeric),
  ('Arugula',        'frying',  0.7000::numeric),

  -- asian greens
  ('Bok choy',        'boiling', 0.9200::numeric),
  ('Bok choy',        'frying',  0.8500::numeric),
  ('Chinese cabbage', 'boiling', 0.9200::numeric),
  ('Chinese cabbage', 'frying',  0.8500::numeric),

  -- root vegetables
  ('Kohlrabi',   'boiling', 0.9200::numeric),
  ('Kohlrabi',   'frying',  0.8700::numeric),
  ('Rutabaga',   'boiling', 0.9300::numeric),
  ('Rutabaga',   'baking',  0.8300::numeric),
  ('Parsley root','boiling', 0.9200::numeric),
  ('Parsley root','baking',  0.8500::numeric),

  -- tropical root vegetables
  ('Yam',        'boiling', 0.9300::numeric),
  ('Yam',        'baking',  0.8500::numeric),
  ('Cassava',    'boiling', 0.9000::numeric),
  ('Taro root',  'boiling', 0.9000::numeric),
  ('Lotus root', 'boiling', 0.9500::numeric),

  -- bamboo shoots: typically boiled
  ('Bamboo shoots','boiling', 0.9500::numeric),

  -- chayote: boiling or frying
  ('Chayote',    'boiling', 0.9200::numeric),
  ('Chayote',    'frying',  0.8500::numeric),

  -- ============================================================
  -- GRAINS — raw grain → cooked (yield > 1.0: water absorption)
  -- source: USDA SR28, standard cooking ratios, cooking science
  -- only boiling applies: raw dry grains require water to cook
  -- ============================================================

  -- rice varieties: per USDA FoodData Central (100g raw dry → cooked weight)
  --   white/basmati/jasmine: 100g raw → ~293g cooked (USDA SR28 item 20045)
  --   brown/black/red: less starch gelatinisation → lower uptake (~2.3x)
  --   arborio: risotto technique absorbs ~3.5x (progressive liquid addition)
  ('White rice',     'boiling', 2.9300::numeric),
  ('Brown rice',     'boiling', 2.3000::numeric),  -- absorbs less, denser; USDA SR28 ~2.3
  ('Basmati rice',   'boiling', 2.9300::numeric),
  ('Jasmine rice',   'boiling', 2.9300::numeric),
  ('Wild rice',      'boiling', 2.5000::numeric),  -- less starch, lower absorption; USDA ~2.5
  ('Black rice',     'boiling', 2.3000::numeric),  -- whole grain, similar to brown rice
  ('Red rice',       'boiling', 2.3000::numeric),  -- whole grain, similar to brown rice
  ('Arborio rice',   'boiling', 3.5000::numeric),  -- risotto: progressive liquid absorption ~3.5x

  -- oats: rolled/quick oats absorb ~2x; steel cut somewhat more
  ('Oats',           'boiling', 2.2000::numeric),
  ('Steel cut oats', 'boiling', 2.5000::numeric),

  -- cracked/parboiled grains
  ('Bulgur',         'boiling', 2.0000::numeric),
  ('Couscous',       'boiling', 2.0000::numeric),
  ('Farro',          'boiling', 2.0000::numeric),
  ('Freekeh',        'boiling', 2.0000::numeric),

  -- whole grains
  ('Barley',         'boiling', 2.5000::numeric),
  ('Millet',         'boiling', 2.0000::numeric),
  ('Teff',           'boiling', 2.0000::numeric),
  ('Sorghum',        'boiling', 2.0000::numeric),

  -- pseudo-cereals
  ('Quinoa',         'boiling', 2.5000::numeric),
  ('White quinoa',   'boiling', 2.5000::numeric),
  ('Red quinoa',     'boiling', 2.5000::numeric),
  ('Buckwheat',      'boiling', 2.1000::numeric),
  ('Buckwheat groats','boiling',2.1000::numeric),
  ('Amaranth',       'boiling', 2.0000::numeric),

  -- polenta and grits: cornmeal absorbs a large volume of water
  ('Polenta',        'boiling', 4.5000::numeric),
  ('Grits',          'boiling', 4.0000::numeric),
  ('Cornmeal',       'boiling', 4.0000::numeric),

  -- pasta (dry → cooked): typically doubles+ in weight
  ('Pasta',              'boiling', 2.2000::numeric),
  ('Spaghetti',          'boiling', 2.2000::numeric),
  ('Whole wheat pasta',  'boiling', 2.1000::numeric),
  ('Penne',              'boiling', 2.2000::numeric),
  ('Fusilli',            'boiling', 2.2000::numeric),
  ('Macaroni',           'boiling', 2.2000::numeric),
  ('Lasagna sheets',     'boiling', 2.2000::numeric),

  -- asian noodles
  ('Rice noodles',  'boiling', 2.5000::numeric),  -- thin, absorb water fast
  ('Egg noodles',   'boiling', 2.0000::numeric),
  ('Udon noodles',  'boiling', 2.0000::numeric),
  ('Soba noodles',  'boiling', 2.0000::numeric),

  -- semolina: cooked as porridge
  ('Semolina',      'boiling', 3.0000::numeric),

  -- ============================================================
  -- LEGUMES — dried → cooked (yield > 1.0: water absorption)
  -- source: USDA SR28 — dried beans/lentils absorb ~2-2.5x their weight
  -- only boiling applies for dried legumes
  -- ============================================================

  -- chickpeas: 1 cup dried (200g) → 2.5 cups cooked (500g) = factor ~2.5
  ('Chickpeas',         'boiling', 2.5000::numeric),

  -- lentils: cook faster, similar absorption
  ('Lentils',           'boiling', 2.5000::numeric),
  ('Red lentils',       'boiling', 2.2500::numeric),  -- disintegrate more, less dense

  -- beans
  ('Black beans',       'boiling', 2.5000::numeric),
  ('Kidney beans',      'boiling', 2.5000::numeric),
  ('Pinto beans',       'boiling', 2.5000::numeric),
  ('White beans',       'boiling', 2.5000::numeric),
  ('Navy beans',        'boiling', 2.5000::numeric),
  ('Cannellini beans',  'boiling', 2.5000::numeric),
  ('Red beans',         'boiling', 2.5000::numeric),
  ('Adzuki beans',      'boiling', 2.5000::numeric),
  ('Mung beans',        'boiling', 2.2500::numeric),
  ('Black-eyed peas',   'boiling', 2.5000::numeric),
  ('Cranberry beans',   'boiling', 2.5000::numeric),
  ('Lima beans',        'boiling', 2.5000::numeric),
  ('Pigeon peas',       'boiling', 2.2500::numeric),
  ('Split peas',        'boiling', 2.2500::numeric),

  -- fresh/green legumes: already hydrated, minimal water uptake when boiled
  ('Edamame',           'boiling', 1.1000::numeric),  -- fresh pods, minimal uptake
  ('Broad beans',       'boiling', 1.0500::numeric),  -- fresh broad beans: ~5% uptake; USDA fresh vegetable data
  ('Fava beans',        'boiling', 1.0500::numeric),  -- fresh fava beans: ~5% uptake (note: dried fava = ~2.0x)

  -- soybeans (dried): similar to other dried beans
  ('Soybeans',          'boiling', 2.5000::numeric),  -- USDA SR28: dried soybeans ~2.5x cooked weight

  -- lupin beans
  ('Lupin beans',       'boiling', 2.5000::numeric)

  -- note: bean sprouts, mung bean sprouts — raw sprouts are consumed as-is or briefly blanched;
  --       no meaningful weight change → excluded from this table
)

-- ----------------------------------------------------------------
-- insert all factors, resolving product ids and method ids by name/slug
-- on conflict: skip silently (idempotent re-run)
-- ----------------------------------------------------------------
insert into product_cooking_factors (product_id, cooking_method_id, yield_factor)
select
  p.id,
  m.id,
  f.yield_factor
from factors f
join products p
  on p.name = f.product_name
  and p.source = 'system'
  and p.deleted_at is null
join cooking_methods m
  on m.slug = f.method_slug
on conflict (product_id, cooking_method_id) do nothing;
