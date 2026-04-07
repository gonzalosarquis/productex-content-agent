-- Ejecutar en Supabase SQL Editor después de crear el proyecto.

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  format text not null check (format in ('carousel', 'video', 'post')),
  subtype text not null,
  producto text not null default '',
  contexto text not null default '',
  tono text[] not null default '{}',
  output jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists generations_user_created_idx
  on public.generations (user_id, created_at desc);

create table if not exists public.knowledge_base (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  brand_dna text not null default '',
  audience text not null default '',
  voice text not null default '',
  products text not null default '',
  examples text not null default '',
  refs text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.generations enable row level security;
alter table public.knowledge_base enable row level security;

create policy "generations_select_own"
  on public.generations for select
  using (auth.uid() = user_id);

create policy "knowledge_base_all_own"
  on public.knowledge_base for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
