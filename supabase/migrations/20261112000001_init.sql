-- youdecide.studio — initial schema
-- Run with the Supabase CLI (`supabase db push`) or paste into the SQL editor.

create extension if not exists pgcrypto;

-- ───────────────────────── helpers ─────────────────────────
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ───────────────────────── admin_users ─────────────────────
create table public.admin_users (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references auth.users(id) on delete cascade,
  role       text not null default 'admin' check (role in ('admin','owner')),
  created_at timestamptz not null default now()
);

-- SECURITY DEFINER so RLS policies can ask "is this caller an admin?"
-- without granting anyone read access to admin_users itself.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ───────────────────────── contributions ───────────────────
create table public.contributions (
  id                        uuid primary key default gen_random_uuid(),
  customer_display_name     text not null check (char_length(customer_display_name) between 1 and 120),
  project_name              text not null default '' check (char_length(project_name) <= 160),
  service_type              text not null check (char_length(service_type) between 1 and 120),
  amount                    bigint not null check (amount >= 0),
  currency                  text not null default 'INR' check (currency = 'INR'),
  link_url                  text not null default '' check (link_url = '' or link_url ~* '^https?://'),
  is_anonymous              boolean not null default false,
  consent_to_public_display boolean not null default false,
  is_published              boolean not null default false,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  -- A row can NEVER be public without recorded consent.
  constraint published_requires_consent check (not is_published or consent_to_public_display)
);
create index contributions_public_idx on public.contributions (is_published, amount desc, created_at desc);
create trigger contributions_updated before update on public.contributions
  for each row execute function public.set_updated_at();

-- Private details live in a separate table that is never exposed publicly.
create table public.contribution_private (
  contribution_id uuid primary key references public.contributions(id) on delete cascade,
  contact_name    text not null default '',
  contact_email   text not null default '',
  notes           text not null default '',
  updated_at      timestamptz not null default now()
);
create trigger contribution_private_updated before update on public.contribution_private
  for each row execute function public.set_updated_at();

-- ───────────────────────── enquiries ───────────────────────
create table public.enquiries (
  id                       uuid primary key default gen_random_uuid(),
  name                     text not null check (char_length(name) between 2 and 80),
  email                    text not null check (char_length(email) <= 254),
  business_name            text not null default '' check (char_length(business_name) <= 120),
  service_interest         text not null,
  project_description      text not null check (char_length(project_description) between 20 and 3000),
  approximate_budget       text not null default 'Not sure yet',
  preferred_contact_method text not null,
  status                   text not null default 'New'
                           check (status in ('New','Contacted','In Discussion','Converted','Closed')),
  internal_notes           text not null default '',
  email_delivery_status    text not null default 'pending'
                           check (email_delivery_status in ('pending','sent','failed')),
  email_delivery_error     text,
  ip_hash                  text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create index enquiries_created_idx on public.enquiries (created_at desc);
create index enquiries_status_idx  on public.enquiries (status);
create index enquiries_ip_idx      on public.enquiries (ip_hash, created_at desc);
create index enquiries_email_idx   on public.enquiries (lower(email), created_at desc);
create trigger enquiries_updated before update on public.enquiries
  for each row execute function public.set_updated_at();

-- ───────────────────────── RLS ─────────────────────────────
alter table public.admin_users          enable row level security;
alter table public.contributions        enable row level security;
alter table public.contribution_private enable row level security;
alter table public.enquiries            enable row level security;

-- admin_users: no policies for anon/authenticated → nobody can read or write via the API.
-- (Rows are created from the SQL editor / service role only.)

-- contributions: admins manage everything. The public does NOT read this table
-- directly; it reads the masked view below.
create policy contributions_admin_all on public.contributions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy contribution_private_admin_all on public.contribution_private
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- enquiries: the public may INSERT (never read). Admins manage everything.
create policy enquiries_public_insert on public.enquiries
  for insert to anon, authenticated
  with check (
    status = 'New' and internal_notes = '' and email_delivery_status = 'pending'
  );
create policy enquiries_admin_all on public.enquiries
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ───────────────────────── public view ─────────────────────
-- Only published rows WITH consent; anonymous rows have the name masked.
-- Runs with the view owner's rights (default), so anon needs no table access.
create view public.public_leaderboard as
select
  id,
  case when is_anonymous then 'Anonymous' else customer_display_name end as display_name,
  case when is_anonymous then '' else project_name end                  as project_name,
  service_type,
  amount,
  currency,
  case when is_anonymous then '' else link_url end                      as link_url,
  created_at
from public.contributions
where is_published and consent_to_public_display;

-- ───────────────────────── grants ──────────────────────────
-- Supabase grants ALL on new public objects to anon/authenticated by default.
-- Strip that back to exactly what each role needs. This matters most for the
-- view: it runs with its owner's rights, so a stray UPDATE/DELETE grant on it
-- would bypass RLS on the base table.
revoke all on public.public_leaderboard   from public, anon, authenticated;
revoke all on public.contributions        from public, anon, authenticated;
revoke all on public.contribution_private from public, anon, authenticated;
revoke all on public.enquiries            from public, anon, authenticated;
revoke all on public.admin_users          from public, anon, authenticated;

grant select on public.public_leaderboard to anon, authenticated;
grant insert on public.enquiries          to anon, authenticated;
grant select, insert, update, delete on public.contributions, public.contribution_private, public.enquiries
  to authenticated;  -- still gated by the is_admin() RLS policies above
