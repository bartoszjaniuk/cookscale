-- migration: fix_active_products_security_invoker
-- purpose: replace the active_products view with security_invoker = true
--          so it respects the querying user's rls policies instead of the
--          view creator's permissions (security definer behaviour)
-- view: active_products
-- notes: views without security_invoker bypass rls by default in postgres.
--        dropping and recreating is required to change view options.

-- drop the existing view that has implicit security definer behaviour
drop view if exists public.active_products;

-- recreate the view with security_invoker = true so that rls policies on
-- the underlying products table are evaluated for the querying user
create view public.active_products
  with (security_invoker = true)
  as
  select * from public.products where deleted_at is null;
