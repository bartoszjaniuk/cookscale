-- migration: create_indexes
-- purpose: create performance indexes across all tables
-- tables: products, calculations, ai_usage_log, product_cooking_factors

---
--- products indexes
---

-- trigram index for partial-match and typo-tolerant product name search
create index idx_products_name_trgm
  on products using gin (name gin_trgm_ops);

-- full-text search index for more precise word-level matching on product names
create index idx_products_name_fts
  on products using gin (to_tsvector('english', name));

-- partial index for filtering active (non-deleted) products by source and category
create index idx_products_active
  on products (source, category_id)
  where deleted_at is null;

-- unique index on external_id per source; allows null external_id for user products (post-mvp)
create unique index uq_products_external_source
  on products (external_id, source)
  where external_id is not null;

---
--- calculations indexes
---

-- user calculation history sorted newest-first (for pagination)
create index idx_calculations_user_created
  on calculations (user_id, created_at desc);

-- filter calculations by type per user (for history view tabs)
create index idx_calculations_user_type
  on calculations (user_id, type);

---
--- ai_usage_log indexes
---

-- rate limiting lookups by ip hash (newest first)
create index idx_ai_log_ip_time
  on ai_usage_log (ip_hash, called_at desc);

-- rate limiting lookups by user (newest first)
create index idx_ai_log_user_time
  on ai_usage_log (user_id, called_at desc);

---
--- product_cooking_factors indexes
---

-- lookup yield factor for a specific product + cooking method pair
create index idx_pcf_product_method
  on product_cooking_factors (product_id, cooking_method_id);

-- lookup all products available for a given cooking method
create index idx_pcf_cooking_method
  on product_cooking_factors (cooking_method_id);
