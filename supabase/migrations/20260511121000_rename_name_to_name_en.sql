-- migration: rename_name_to_name_en
-- purpose: rename column `name` to `name_en` to clarify language intent.

drop view if exists public.active_products;

alter table public.products rename column name to name_en;

create view public.active_products as
  select * from public.products where deleted_at is null;
