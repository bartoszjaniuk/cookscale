-- migration: improve_match_product_rpc
-- purpose: match products by name_en OR name_pl (pg_trgm), return locale-aware display name

-- trigram index for polish product names (name_en index already exists from rename)
create index if not exists idx_products_name_pl_trgm
  on products using gin (name_pl gin_trgm_ops);

create or replace function match_product_by_name(
  p_ingredient text,
  p_locale text default 'pl'
)
returns table (
  id uuid,
  name_en text,
  name_pl text,
  product_name text,
  calories_kcal numeric,
  protein_g numeric,
  fat_g numeric,
  carbs_g numeric,
  matched_confidence real
)
language sql
security definer
set search_path = public
as $$
  with normalized as (
    select lower(trim(p_ingredient)) as term
  ),
  candidates as (
    select
      p.id,
      p.name_en,
      p.name_pl,
      p.calories_kcal,
      p.protein_g,
      p.fat_g,
      p.carbs_g,
      greatest(
        similarity(lower(p.name_en), n.term),
        similarity(lower(p.name_pl), n.term)
      ) as matched_confidence
    from products p
    cross join normalized n
    where p.deleted_at is null
      and (
        lower(p.name_en) % n.term
        or lower(p.name_pl) % n.term
        or similarity(lower(p.name_en), n.term) >= 0.25
        or similarity(lower(p.name_pl), n.term) >= 0.25
      )
  )
  select
    c.id,
    c.name_en,
    c.name_pl,
    case
      when lower(coalesce(p_locale, 'pl')) = 'en' then c.name_en
      else c.name_pl
    end as product_name,
    c.calories_kcal,
    c.protein_g,
    c.fat_g,
    c.carbs_g,
    c.matched_confidence
  from candidates c
  order by c.matched_confidence desc
  limit 1;
$$;
