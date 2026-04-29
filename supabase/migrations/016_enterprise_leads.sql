-- ============================================================================
-- Migration 016 — enterprise_leads
-- ----------------------------------------------------------------------------
-- Tabla para captura de leads B2B desde /empresas. Anónima por diseño:
-- las empresas que llenan el form no tienen cuenta auth todavía, así que
-- no hay user_id. La PII (nombre, correo, empresa) queda detrás de RLS
-- service_role-only para que el endpoint pueda insertar pero el cliente
-- nunca pueda leer.
--
-- Campos:
--  - name / email / company         → contacto (mandatorio)
--  - notes                          → texto libre opcional del form
--  - questionnaire                  → respuestas del slider 1-5 (jsonb)
--  - source                         → de qué entrypoint vino el lead
--                                     (default 'empresas-page'; preparado
--                                     para futuros canales: chatbot,
--                                     dashboard upsell, etc)
--  - status                         → workflow del lead (new, contacted,
--                                     qualified, converted, dropped)
--
-- Índices: created_at desc para listar más recientes; email para detectar
-- duplicados rápido sin scan; status para filtrar pipeline.
-- ============================================================================

create table if not exists public.enterprise_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text not null,
  notes text,
  questionnaire jsonb not null default '{}'::jsonb,
  source text not null default 'empresas-page',
  status text not null default 'new'
    check (status in ('new', 'contacted', 'qualified', 'converted', 'dropped')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_enterprise_leads_created_at
  on public.enterprise_leads (created_at desc);
create index if not exists idx_enterprise_leads_email
  on public.enterprise_leads (email);
create index if not exists idx_enterprise_leads_status
  on public.enterprise_leads (status);

-- ── RLS ────────────────────────────────────────────────────────────────────
-- Lectura: solo service_role. La PII no debe filtrar al cliente.
-- Inserción: anon + authenticated pueden insertar (endpoint público).
-- Actualización/borrado: solo service_role (gestión interna del pipeline).
alter table public.enterprise_leads enable row level security;

create policy "service_role can read enterprise_leads"
  on public.enterprise_leads
  for select
  to service_role
  using (true);

create policy "anyone can insert enterprise_leads"
  on public.enterprise_leads
  for insert
  to anon, authenticated
  with check (true);

create policy "service_role can update enterprise_leads"
  on public.enterprise_leads
  for update
  to service_role
  using (true)
  with check (true);

create policy "service_role can delete enterprise_leads"
  on public.enterprise_leads
  for delete
  to service_role
  using (true);

-- ── updated_at trigger ─────────────────────────────────────────────────────
create or replace function public.tg_enterprise_leads_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_enterprise_leads_updated_at on public.enterprise_leads;
create trigger trg_enterprise_leads_updated_at
  before update on public.enterprise_leads
  for each row
  execute function public.tg_enterprise_leads_set_updated_at();

revoke execute on function public.tg_enterprise_leads_set_updated_at()
  from public, anon, authenticated;
