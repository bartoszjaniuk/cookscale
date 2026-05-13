-- migration: add_translation_key_to_products
-- purpose: add translation_key column to products table to support i18n
-- tables: products
-- notes: translation_key is generated from the name by uppercasing and replacing spaces with underscores

-- add translation_key column
alter table public.products 
add column translation_key text;

-- generate translation_key for existing products
update public.products 
set translation_key = upper(replace(replace(replace(name, ' ', '_'), '-', '_'), '''', ''));

-- make the field required
alter table public.products 
alter column translation_key set not null;

-- recreate active_products view to include the new column
drop view if exists public.active_products;
create view public.active_products as
  select * from public.products where deleted_at is null;

