-- Phase 22.8-06 — /join status switch + structured study field
--
-- Additive launch migration. Existing waitlist rows are treated as student
-- entries because the previous /join form required a university field.

do $$
begin
  create type public.waitlist_status as enum ('student', 'working', 'alumni', 'other');
exception
  when duplicate_object then null;
end $$;

alter table public.waitlist
  add column if not exists status public.waitlist_status not null default 'student',
  add column if not exists study_field text;

-- Backfill old rows explicitly. The default covers future inserts but this
-- makes the migration intent visible for existing data exports.
update public.waitlist
set status = 'student'
where status is null;

-- The new status switch allows non-student applicants. University remains
-- encouraged for student/alumni entries at the application layer, but it can
-- no longer be a database-level requirement for working/other entries.
alter table public.waitlist
  alter column university drop not null;

comment on type public.waitlist_status is
  'Phase 22.8-06 /join applicant status: student, working, alumni, other.';

comment on column public.waitlist.status is
  'Applicant status selected on /join before education fields.';

comment on column public.waitlist.study_field is
  'Structured broad study field selected on /join. Complements legacy free-text study_program.';
