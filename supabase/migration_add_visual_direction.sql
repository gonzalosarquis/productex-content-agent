-- Ejecutar una vez en Supabase SQL Editor si la tabla ya existía sin esta columna.
alter table public.knowledge_base
  add column if not exists visual_direction text not null default '';
