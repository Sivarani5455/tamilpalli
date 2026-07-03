create table if not exists public.nimisham_exercises (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  prompt_translation jsonb not null,
  words jsonb not null,
  difficulty public.difficulty_level not null default 'beginner',
  time_limit_seconds integer not null default 60,
  allowed_plans public.plan_slug[] not null default array['standard']::public.plan_slug[],
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nimisham_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  exercise_id uuid not null references public.nimisham_exercises(id) on delete cascade,
  score integer not null default 0,
  correct_found integer not null default 0,
  total_correct integer not null default 0,
  wrong_clicks integer not null default 0,
  time_used_seconds integer not null default 0,
  completed_at timestamptz not null default now()
);

insert into public.content_categories (title, slug, description, type, is_active)
values (
  'Nimisham',
  'nimisham',
  'Race the clock and tap every Tamil word matching the prompt.',
  'nimisham',
  true
)
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  type = excluded.type,
  is_active = excluded.is_active,
  updated_at = now();
