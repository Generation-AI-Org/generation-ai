-- Phase 25 — Circle-API-Sync: user_circle_links table
-- Tracks Circle-Member-ID + provision status per Supabase-User.
-- Source of truth for the Circle <→ Supabase link.
-- Complements raw_user_meta_data.circle_member_id (D-07) which is the
-- fast-path copy for session-based reads; this table is the authoritative
-- record including error history.

create table if not exists public.user_circle_links (
  user_id uuid primary key references auth.users(id) on delete cascade,
  circle_member_id text not null,
  circle_provisioned_at timestamptz,
  last_error text,
  last_error_at timestamptz,
  created_at timestamptz not null default now()
);

-- Prevent duplicate Circle-member mappings (defence-in-depth against race
-- conditions during reprovision).
create unique index if not exists user_circle_links_member_id_unique
  on public.user_circle_links (circle_member_id);

-- RLS
alter table public.user_circle_links enable row level security;

drop policy if exists "service_role_select_user_circle_links" on public.user_circle_links;
create policy "service_role_select_user_circle_links"
  on public.user_circle_links
  for select
  to service_role
  using (true);

drop policy if exists "service_role_all_user_circle_links" on public.user_circle_links;
create policy "service_role_all_user_circle_links"
  on public.user_circle_links
  for all
  to service_role
  using (true)
  with check (true);

comment on table public.user_circle_links is
  'Phase 25 Circle-API-Sync: Supabase↔Circle member mapping + provision status. Written by server action submitJoinSignup (apps/website/app/actions/signup.ts) + admin reprovision route via service_role. raw_user_meta_data.circle_member_id mirrors the latest successful provision for session-based reads.';

-- Revoke default public-schema grants from anon/authenticated.
revoke all on public.user_circle_links from anon, authenticated;
