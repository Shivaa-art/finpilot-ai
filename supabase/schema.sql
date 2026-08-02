-- ============================================================
-- FinPilot AI — Supabase schema
-- Run this once in your Supabase project's SQL Editor
-- (Project → SQL Editor → New query → paste → Run)
-- ============================================================

-- 1. Companies — one row per onboarded business, owned by the signed-up user
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  industry text not null,
  country text not null,
  employees text not null,
  annual_revenue text not null,
  financial_software text,
  goals text[],
  created_at timestamptz not null default now()
);

-- 2. Transactions — the financial data uploaded via CSV/Excel
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  txn_date date not null,
  description text not null,
  category text not null,
  amount numeric not null,
  type text not null check (type in ('income', 'expense')),
  created_at timestamptz not null default now()
);

create index if not exists transactions_company_id_idx on public.transactions(company_id);
create index if not exists transactions_txn_date_idx on public.transactions(txn_date);

-- ============================================================
-- Row Level Security — every user can only ever see their own data
-- ============================================================

alter table public.companies enable row level security;
alter table public.transactions enable row level security;

create policy "Users can view their own companies"
  on public.companies for select
  using (auth.uid() = user_id);

create policy "Users can insert their own companies"
  on public.companies for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own companies"
  on public.companies for update
  using (auth.uid() = user_id);

create policy "Users can delete their own companies"
  on public.companies for delete
  using (auth.uid() = user_id);

create policy "Users can view transactions for their own companies"
  on public.transactions for select
  using (
    exists (
      select 1 from public.companies
      where companies.id = transactions.company_id
      and companies.user_id = auth.uid()
    )
  );

create policy "Users can insert transactions for their own companies"
  on public.transactions for insert
  with check (
    exists (
      select 1 from public.companies
      where companies.id = transactions.company_id
      and companies.user_id = auth.uid()
    )
  );

create policy "Users can delete transactions for their own companies"
  on public.transactions for delete
  using (
    exists (
      select 1 from public.companies
      where companies.id = transactions.company_id
      and companies.user_id = auth.uid()
    )
  );
