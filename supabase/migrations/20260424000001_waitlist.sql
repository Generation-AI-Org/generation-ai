-- Phase 23 — /join Waitlist V1
-- D-05: separate `waitlist` table, RLS restricts to service_role only.
-- Phase 25 (Circle-API-Sync) migrates or archives this table.

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text not null,
  university text not null,
  study_program text,
  marketing_opt_in boolean not null default false,
  redirect_after text,
  source text not null default 'join-page',
  created_at timestamptz not null default now(),
  notified_at timestamptz
);

-- Case-insensitive unique index on email (prevents duplicate waitlist entries)
create unique index if not exists waitlist_email_unique_ci
  on public.waitlist (lower(email));

-- Index for the Phase 25 batch-notification job
create index if not exists waitlist_pending_notification_idx
  on public.waitlist (created_at)
  where notified_at is null;

-- RLS
alter table public.waitlist enable row level security;

-- Service role: full read + insert (server-action via createAdminClient)
drop policy if exists "service_role_select_waitlist" on public.waitlist;
create policy "service_role_select_waitlist"
  on public.waitlist
  for select
  to service_role
  using (true);

drop policy if exists "service_role_insert_waitlist" on public.waitlist;
create policy "service_role_insert_waitlist"
  on public.waitlist
  for insert
  to service_role
  with check (true);

comment on table public.waitlist is
  'Phase 23 /join waitlist (V1). Inserted by server action waitlist.submitJoinWaitlist via service_role admin client. Phase 25 will migrate accepted entries into auth.users via Circle-API-Sync.';

-- Revoke default public-schema grants from anon/authenticated.
-- With RLS enabled and no anon/authenticated policies, PostgREST should return 401/403
-- without these grants (rather than 200 empty set, which is the default behavior).
revoke all on public.waitlist from anon, authenticated;
