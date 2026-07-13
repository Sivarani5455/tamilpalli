create table if not exists public.thirukkural_lessons (
  id uuid primary key default gen_random_uuid(),
  number integer not null unique,
  title text not null,
  slug text not null unique,
  section text not null default '',
  chapter text not null default '',
  difficulty public.difficulty_level not null default 'beginner',
  kural_lines jsonb not null default '[]'::jsonb,
  porul text not null,
  quiz jsonb not null default '[]'::jsonb,
  fill_blanks jsonb not null default '[]'::jsonb,
  allowed_plans public.plan_slug[] not null default array['standard']::public.plan_slug[],
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.content_categories (title, slug, description, type, is_active)
values (
  'Thirukkural',
  'thirukkural',
  'Learn Thirukkural with meaning, quiz and fill-in-the-blank practice.',
  'thirukkural',
  true
)
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  type = excluded.type,
  is_active = excluded.is_active,
  updated_at = now();
