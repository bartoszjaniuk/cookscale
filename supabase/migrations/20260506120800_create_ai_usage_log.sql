-- migration: create_ai_usage_log
-- purpose: create ai_usage_log table, enable rls (no user-facing policies)
-- table: ai_usage_log
-- notes: rate limiting for ai calls per ip and per user.
--         accessible only via service_role — invisible through postgrest for clients.
--         ip stored as sha-256 hash with salt (gdpr compliance).
--         salt stored in supabase vault (vault.create_secret).
--         lazy cleanup of records older than 48h happens at the start of each ai edge function call.

create table ai_usage_log (
  id          bigserial    primary key,
  user_id     uuid         references auth.users(id) on delete set null,  -- nullable (anonymous users)
  ip_hash     text         not null,     -- sha-256 with salt, not raw ip (gdpr)
  called_at   timestamptz  not null default now(),
  success     boolean      not null default true
);

-- enable row level security
-- no policies for anon or authenticated — table accessible only via service_role (bypasses rls)
alter table ai_usage_log enable row level security;
