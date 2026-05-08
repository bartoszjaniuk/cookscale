-- migration: create_updated_at_triggers
-- purpose: auto-update updated_at columns using moddatetime extension
-- tables: profiles, products
-- notes: requires moddatetime extension (created in 20260506120000_create_extensions.sql)

-- auto-set profiles.updated_at to now() on every row update
create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function moddatetime(updated_at);

-- auto-set products.updated_at to now() on every row update
create trigger trg_products_updated_at
  before update on products
  for each row execute function moddatetime(updated_at);
