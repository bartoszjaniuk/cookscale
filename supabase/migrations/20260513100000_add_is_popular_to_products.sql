-- migration: add_is_popular_to_products
-- purpose: add is_popular boolean flag to highlight common products
-- notes: updates specific products to be popular by default, renames Proso to Kasza jaglana

drop view if exists public.active_products;

alter table public.products add column is_popular boolean default false;

create view public.active_products as
  select * from public.products where deleted_at is null;

-- Rename 'Proso' to 'Kasza jaglana' for better PL understanding
update public.products
set name_pl = 'Kasza jaglana'
where name_en = 'Millet';

-- Update specific products as popular based on user selection
update public.products
set is_popular = true
where name_pl in (
  'Ryż biały',
  'Makaron',
  'Makaron pełnoziarnisty',
  'Kasza gryczana',
  'Kasza jaglana',
  'Ziemniak',
  'Płatki owsiane',
  'Pierś z kurczaka',
  'Łosoś'
);