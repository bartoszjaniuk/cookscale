-- migration: create_match_product_rpc
-- purpose: create an RPC to match products by name using pg_trgm similarity

create or replace function match_product_by_name(p_ingredient text)
returns table (
  id uuid,
  name_en text,
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
  select 
    id, 
    name_en, 
    calories_kcal, 
    protein_g, 
    fat_g, 
    carbs_g,
    similarity(name_en, p_ingredient) as matched_confidence
  from products
  where deleted_at is null
    and name_en % p_ingredient
  order by matched_confidence desc
  limit 1;
$$;
