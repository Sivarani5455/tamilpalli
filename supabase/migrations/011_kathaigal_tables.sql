create table if not exists public.kathaigal_stories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  difficulty public.difficulty_level not null default 'beginner',
  cover_image_url text,
  paragraphs jsonb not null default '[]'::jsonb,
  questions jsonb not null default '[]'::jsonb,
  allowed_plans public.plan_slug[] not null default array['standard']::public.plan_slug[],
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.kathaigal_stories
add column if not exists questions jsonb not null default '[]'::jsonb;

insert into public.content_categories (title, slug, description, type, is_active)
values (
  'Kathaigal',
  'kathaigal',
  'Read illustrated Tamil stories, paragraph by paragraph.',
  'kathaigal',
  true
)
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  type = excluded.type,
  is_active = excluded.is_active,
  updated_at = now();
