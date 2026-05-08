-- migration: create_limit_calculations_trigger
-- purpose: enforce a maximum of 100 calculations per user
-- table: calculations
-- notes: destructive and irreversible — deletes the oldest calculations beyond the 100 limit
--         after each insert. this keeps the history bounded without requiring a cron job.

create or replace function fn_limit_calculations_per_user()
returns trigger language plpgsql as $$
begin
  -- delete all calculations for the inserting user that fall outside the top 100 (by created_at desc)
  delete from calculations
  where id in (
    select id from (
      select id,
             row_number() over (partition by user_id order by created_at desc) as rn
      from calculations
      where user_id = new.user_id
    ) ranked
    where rn > 100
  );
  return new;
end;
$$;

create trigger trg_limit_calculations_per_user
  after insert on calculations
  for each row execute function fn_limit_calculations_per_user();
