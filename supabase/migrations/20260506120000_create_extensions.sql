-- migration: create_extensions
-- purpose: enable required postgresql extensions
-- extensions: pg_trgm (trigram similarity for fuzzy text search), moddatetime (auto-update updated_at columns)

-- pg_trgm: enables trigram-based indexes for partial-match and typo-tolerant product name search
create extension if not exists "pg_trgm";

-- moddatetime: provides a trigger function that auto-updates a timestamptz column on row modification
create extension if not exists "moddatetime";
