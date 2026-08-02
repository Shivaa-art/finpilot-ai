-- ============================================================
-- FinPilot AI — Phase 6 migration: Team Management, Notifications, API Access
-- Run this in the Supabase SQL Editor AFTER schema.sql and phase4_decision_memory.sql
-- ============================================================

-- 1. Company members — real multi-user access to a company
create table if not exists public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  invited_email text not null,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  status text not null default 'pending' check (status in ('pending', 'active')),
  created_at timestamptz not null default now(),
  unique (company_id, invited_email)
);

create index if not exists company_members_company_id_idx on public.company_members(company_id);
create index if not exists company_members_user_id_idx on public.company_members(user_id);

-- Helper function: is the current user an owner or active member of this company?
-- security definer so it can read company_members/companies without recursive RLS issues.
create or replace function public.has_company_access(target_company_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.companies
    where id = target_company_id and user_id = auth.uid()
  ) or exists (
    select 1 from public.company_members
    where company_id = target_company_id and user_id = auth.uid() and status = 'active'
  );
$$;

alter table public.company_members enable row level security;

drop policy if exists "Members visible to company owner or the member themselves" on public.company_members;
create policy "Members visible to company owner or the member themselves"
  on public.company_members for select
  using (
    exists (select 1 from public.companies where companies.id = company_members.company_id and companies.user_id = auth.uid())
    or user_id = auth.uid()
  );

drop policy if exists "Only the company owner can invite members" on public.company_members;
create policy "Only the company owner can invite members"
  on public.company_members for insert
  with check (
    exists (select 1 from public.companies where companies.id = company_members.company_id and companies.user_id = auth.uid())
  );

drop policy if exists "Owner can update members, or an invited user can claim their own pending invite" on public.company_members;
create policy "Owner can update members, or an invited user can claim their own pending invite"
  on public.company_members for update
  using (
    exists (select 1 from public.companies where companies.id = company_members.company_id and companies.user_id = auth.uid())
    or invited_email = (select email from auth.users where id = auth.uid())
  );

drop policy if exists "Only the company owner can remove members" on public.company_members;
create policy "Only the company owner can remove members"
  on public.company_members for delete
  using (
    exists (select 1 from public.companies where companies.id = company_members.company_id and companies.user_id = auth.uid())
  );

-- ============================================================
-- 2. Notifications
-- ============================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  type text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_company_id_idx on public.notifications(company_id);

alter table public.notifications enable row level security;

drop policy if exists "Notifications visible to company owner or members" on public.notifications;
create policy "Notifications visible to company owner or members"
  on public.notifications for select
  using (public.has_company_access(company_id));

drop policy if exists "Notifications insertable by company owner or members" on public.notifications;
create policy "Notifications insertable by company owner or members"
  on public.notifications for insert
  with check (public.has_company_access(company_id));

drop policy if exists "Notifications updatable by company owner or members" on public.notifications;
create policy "Notifications updatable by company owner or members"
  on public.notifications for update
  using (public.has_company_access(company_id));

-- ============================================================
-- 3. API keys
-- ============================================================
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  key text not null unique,
  label text not null default 'Default key',
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

alter table public.api_keys enable row level security;

drop policy if exists "API keys manageable by the company owner only" on public.api_keys;
create policy "API keys manageable by the company owner only"
  on public.api_keys for all
  using (exists (select 1 from public.companies where companies.id = api_keys.company_id and companies.user_id = auth.uid()));

-- Security-definer function: lets a request authenticated only by an API key
-- (no Supabase session, so no auth.uid()) securely fetch that company's
-- transactions without opening up RLS to anonymous access more broadly.
-- Returns an empty set for an invalid/unknown key.
create or replace function public.get_transactions_for_key(input_key text)
returns setof public.transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  target_company_id uuid;
begin
  select company_id into target_company_id from public.api_keys where key = input_key;
  if target_company_id is null then
    return;
  end if;
  update public.api_keys set last_used_at = now() where key = input_key;
  return query select * from public.transactions where company_id = target_company_id order by txn_date asc;
end;
$$;

grant execute on function public.get_transactions_for_key(text) to anon, authenticated;

-- ============================================================
-- 4. Integrations (honest scope: webhook URL only, no OAuth)
-- ============================================================
alter table public.companies add column if not exists webhook_url text;

-- Also extend transaction/decision_log/companies visibility to active members, not just the owner.
-- (Safe to re-run: drops and recreates the SELECT policies to add member access.)
drop policy if exists "Users can view their own companies" on public.companies;
drop policy if exists "Users can view companies they own or are a member of" on public.companies;
create policy "Users can view companies they own or are a member of"
  on public.companies for select
  using (auth.uid() = user_id or public.has_company_access(id));

drop policy if exists "Users can view transactions for their own companies" on public.transactions;
drop policy if exists "Users can view transactions for companies they have access to" on public.transactions;
create policy "Users can view transactions for companies they have access to"
  on public.transactions for select
  using (public.has_company_access(company_id));
