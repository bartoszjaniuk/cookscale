-- migration: add_name_pl_to_products
-- purpose: remove translation_key from previous migration and replace with name_pl
-- notes: applies polish translations for existing seed products

-- drop previous view to allow schema changes
drop view if exists public.active_products;

-- drop old column, add new column
alter table public.products drop column if exists translation_key;
alter table public.products add column name_pl text;

-- update existing rows with Polish translations
update public.products
set name_pl = case name
  when 'Broccoli' then 'Brokuł'
  when 'Carrot' then 'Marchew'
  when 'Spinach' then 'Szpinak'
  when 'Tomato' then 'Pomidor'
  when 'Cucumber' then 'Ogórek'
  when 'Bell pepper' then 'Papryka'
  when 'Lettuce' then 'Sałata'
  when 'Garlic' then 'Czosnek'
  when 'Onion' then 'Cebula'
  when 'Asparagus' then 'Szparagi'
  when 'Cabbage' then 'Kapusta'
  when 'Zucchini' then 'Cukinia'
  when 'Potato' then 'Ziemniak'
  when 'Mushroom' then 'Pieczarka'
  when 'Celery' then 'Seler'
  when 'Cauliflower' then 'Kalafior'
  when 'Eggplant' then 'Bakłażan'
  when 'Kale' then 'Jarmuż'
  when 'Arugula' then 'Rukola'
  when 'Beetroot' then 'Burak'
  when 'Radish' then 'Rzodkiewka'
  when 'Turnip' then 'Rzepa'
  when 'Sweet potato' then 'Batat'
  when 'Pumpkin' then 'Dynia'
  when 'Butternut squash' then 'Dynia piżmowa'
  when 'Leek' then 'Por'
  when 'Spring onion' then 'Dymka'
  when 'Shallot' then 'Szalotka'
  when 'Fennel' then 'Koper włoski'
  when 'Parsley root' then 'Pietruszka korzeń'
  when 'Parsnip' then 'Pasternak'
  when 'Rutabaga' then 'Brukiew'
  when 'Kohlrabi' then 'Kalarepa'
  when 'Brussels sprouts' then 'Brukselka'
  when 'Bok choy' then 'Kapusta bok choy'
  when 'Chinese cabbage' then 'Kapusta pekińska'
  when 'Collard greens' then 'Kapusta warzywna'
  when 'Mustard greens' then 'Gorczyca sarepska'
  when 'Swiss chard' then 'Boćwina'
  when 'Endive' then 'Cykoria'
  when 'Radicchio' then 'Radicchio'
  when 'Watercress' then 'Rukiew wodna'
  when 'Cilantro' then 'Kolendra'
  when 'Basil' then 'Bazylia'
  when 'Oregano' then 'Oregano'
  when 'Thyme' then 'Tymianek'
  when 'Rosemary' then 'Rozmaryn'
  when 'Sage' then 'Szałwia'
  when 'Green beans' then 'Fasolka szparagowa zielona'
  when 'Wax beans' then 'Fasolka szparagowa żółta'
  when 'Jalapeno' then 'Jalapeno'
  when 'Chili pepper' then 'Papryczka chili'
  when 'Habanero' then 'Habanero'
  when 'Poblano' then 'Poblano'
  else name -- fallback for any other seed entries missing here
end;

-- make field required
alter table public.products alter column name_pl set not null;

-- recreate view
create view public.active_products as
  select * from public.products where deleted_at is null;
