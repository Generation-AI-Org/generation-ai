-- Phase 27 — /join field cleanup
--
-- Add early_career as the launch-facing status and capture birth year for
-- aggregate targeting. Keep previous enum values for existing rows.

alter type public.waitlist_status add value if not exists 'early_career';

alter table public.waitlist
  add column if not exists birth_year integer;

comment on column public.waitlist.birth_year is
  'Optional birth year from /join, used for aggregate audience targeting.';
