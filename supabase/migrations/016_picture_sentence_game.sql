alter type public.content_type add value if not exists 'picture_sentence';

create table if not exists public.picture_sentence_games (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  difficulty public.difficulty_level not null default 'beginner',
  time_per_image_seconds integer not null default 30 check (time_per_image_seconds > 0),
  cards jsonb not null default '[]'::jsonb,
  allowed_plans public.plan_slug[] not null default array['standard', 'elite']::public.plan_slug[],
  is_active boolean not null default true,
  publish_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists picture_sentence_games_publish_date_idx
  on public.picture_sentence_games (publish_date, is_active);

create table if not exists public.picture_sentence_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  game_id uuid not null references public.picture_sentence_games(id) on delete cascade,
  score integer not null default 0,
  correct_choices integer not null default 0,
  total_correct_choices integer not null default 0,
  completed_images integer not null default 0,
  time_used_seconds integer not null default 0,
  completed_at timestamptz not null default now()
);

alter table public.picture_sentence_scores enable row level security;

drop policy if exists "picture_sentence_scores_select_self" on public.picture_sentence_scores;
create policy "picture_sentence_scores_select_self"
on public.picture_sentence_scores for select
using (auth.uid() = user_id);

drop policy if exists "picture_sentence_scores_insert_self" on public.picture_sentence_scores;
create policy "picture_sentence_scores_insert_self"
on public.picture_sentence_scores for insert
with check (auth.uid() = user_id);

insert into public.content_categories (title, slug, description, type, is_active)
values (
  'படம் + வாக்கியம்',
  'padam-vakkiyam',
  'Choose every Tamil sentence that correctly describes each picture.',
  'picture_sentence',
  true
)
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  type = excluded.type,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.content_plan_access (content_category_id, plan_id, is_enabled)
select category.id, plan.id, true
from public.content_categories category
cross join public.subscription_plans plan
where category.slug = 'padam-vakkiyam'
  and plan.slug in ('standard', 'elite')
on conflict (content_category_id, plan_id) do update
set is_enabled = true, updated_at = now();
