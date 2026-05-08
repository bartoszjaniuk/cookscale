-- migration: create_calculations
-- purpose: create calculations table, enable rls with granular policies
-- table: calculations
-- notes: append-only history of user calculations. no update/delete for users.
--         limit of 100 records per user enforced by trigger (separate migration).
--         jsonb fields (input, result, warnings) validated by zod in edge function;
--         db only checks they are objects.

create table calculations (
  id                 uuid                      primary key default gen_random_uuid(),
  user_id            uuid                      not null references auth.users(id) on delete cascade,
  type               calculation_type_enum     not null,
  direction          direction_enum,                              -- nullable (null for 'dish' type)
  product_id         uuid                      references products(id) on delete set null,   -- nullable
  cooking_method_id  uuid                      references cooking_methods(id) on delete set null, -- nullable
  input_text         text,                                        -- nullable, raw user text (dish mode)
  input              jsonb                     not null,          -- structured input
  result             jsonb                     not null,          -- structured result
  warnings           jsonb,                                       -- nullable, unrecognized ingredients (dish mode)
  created_at         timestamptz               not null default now(),

  -- product-type calculations must have product_id, direction, and cooking_method_id
  constraint chk_calc_product_fields check (
    type != 'product' or
    (product_id is not null and direction is not null and cooking_method_id is not null)
  ),
  -- dish-type calculations must have input_text and must not have product/direction/cooking_method fields
  constraint chk_calc_dish_fields check (
    type != 'dish' or
    (input_text is not null and direction is null and product_id is null and cooking_method_id is null)
  ),
  -- minimal jsonb validation — full schema enforced by zod in edge function
  constraint chk_calc_input_object  check (jsonb_typeof(input)  = 'object'),
  constraint chk_calc_result_object check (jsonb_typeof(result) = 'object')
);

-- enable row level security
alter table calculations enable row level security;

-- allow authenticated users to read their own calculations
create policy "authenticated_select_own_calculations"
  on calculations for select
  to authenticated
  using (auth.uid() = user_id);

-- allow authenticated users to insert their own calculations
create policy "authenticated_insert_own_calculations"
  on calculations for insert
  to authenticated
  with check (auth.uid() = user_id);

-- explicitly deny update on calculations for authenticated users (append-only history)
create policy "authenticated_deny_update_calculations"
  on calculations for update
  to authenticated
  using (false);

-- explicitly deny delete on calculations for authenticated users (append-only history)
create policy "authenticated_deny_delete_calculations"
  on calculations for delete
  to authenticated
  using (false);
