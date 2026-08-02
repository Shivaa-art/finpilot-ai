-- ============================================================
-- FinPilot AI — Phase 4 migration: Decision Memory Engine
-- Run this in the Supabase SQL Editor AFTER schema.sql
-- ============================================================

create table if not exists public.decision_log (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  recommendation_id text not null,
  title text not null,
  category text not null,
  confidence integer not null,
  magnitude numeric not null,
  direction text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists decision_log_company_id_idx on public.decision_log(company_id);
create index if not exists decision_log_status_idx on public.decision_log(status);

alter table public.decision_log enable row level security;

create policy "Users can view decisions for their own companies"
  on public.decision_log for select
  using (
    exists (
      select 1 from public.companies
      where companies.id = decision_log.company_id
      and companies.user_id = auth.uid()
    )
  );

create policy "Users can insert decisions for their own companies"
  on public.decision_log for insert
  with check (
    exists (
      select 1 from public.companies
      where companies.id = decision_log.company_id
      and companies.user_id = auth.uid()
    )
  );

create policy "Users can update decisions for their own companies"
  on public.decision_log for update
  using (
    exists (
      select 1 from public.companies
      where companies.id = decision_log.company_id
      and companies.user_id = auth.uid()
    )
  );
