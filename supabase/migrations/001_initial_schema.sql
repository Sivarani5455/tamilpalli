create extension if not exists "pgcrypto";

create type public.app_role as enum ('user', 'admin');
create type public.plan_slug as enum ('discovery', 'standard', 'elite');
create type public.subscription_status as enum ('active', 'expired', 'cancelled', 'pending_payment');
create type public.content_type as enum ('word_search', 'fill_in_the_blanks', 'image_hunt', 'quiz', 'lesson', 'audio', 'video', 'exercise');
create type public.difficulty_level as enum ('beginner', 'intermediate', 'advanced');

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  full_name text not null,
  email text not null unique,
  role public.app_role not null default 'user',
  preferred_language text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug public.plan_slug not null unique,
  price numeric(10,2) not null,
  currency text not null default 'EUR',
  duration_days integer not null default 30,
  description text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  plan_id uuid not null references public.subscription_plans(id) on delete restrict,
  status public.subscription_status not null default 'pending_payment',
  started_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_categories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  type public.content_type not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_plan_access (
  id uuid primary key default gen_random_uuid(),
  content_category_id uuid not null references public.content_categories(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id) on delete cascade,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (content_category_id, plan_id)
);

create table if not exists public.word_search_grids (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  grid_data jsonb not null,
  words jsonb not null,
  difficulty public.difficulty_level not null default 'beginner',
  time_limit_seconds integer not null default 180,
  allowed_plans public.plan_slug[] not null default array['discovery']::public.plan_slug[],
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.word_search_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  grid_id uuid not null references public.word_search_grids(id) on delete cascade,
  score integer not null default 0,
  words_found integer not null default 0,
  total_words integer not null default 0,
  time_used_seconds integer not null default 0,
  completed_at timestamptz not null default now()
);

create table if not exists public.fill_blank_exercises (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  difficulty public.difficulty_level not null default 'beginner',
  interface_language text not null default 'en',
  timer_enabled boolean not null default true,
  time_limit_seconds integer not null default 180,
  free_input_enabled boolean not null default false,
  drag_and_drop_enabled boolean not null default false,
  allowed_plans public.plan_slug[] not null default array['standard']::public.plan_slug[],
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fill_blank_questions (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.fill_blank_exercises(id) on delete cascade,
  sentence_template text not null,
  sentence_translation jsonb not null,
  explanation jsonb not null,
  grammar_note text,
  context_note text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fill_blank_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.fill_blank_questions(id) on delete cascade,
  blank_key text not null default 'blank_1',
  option_text text not null,
  is_correct boolean not null default false,
  explanation_if_wrong text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fill_blank_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  exercise_id uuid not null references public.fill_blank_exercises(id) on delete cascade,
  score integer not null default 0,
  total_questions integer not null default 0,
  correct_answers integer not null default 0,
  wrong_answers integer not null default 0,
  attempts_count integer not null default 0,
  time_used_seconds integer not null default 0,
  completed_at timestamptz not null default now()
);

create table if not exists public.fill_blank_user_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  exercise_id uuid not null references public.fill_blank_exercises(id) on delete cascade,
  question_id uuid not null references public.fill_blank_questions(id) on delete cascade,
  selected_option_id uuid,
  typed_answer text,
  is_correct boolean not null default false,
  attempts_count integer not null default 1,
  answered_at timestamptz not null default now()
);

create table if not exists public.image_hunt_exercises (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  image_url text,
  difficulty public.difficulty_level not null default 'beginner',
  mode text not null default 'discovery',
  timer_enabled boolean not null default true,
  time_limit_seconds integer not null default 240,
  hints_enabled boolean not null default true,
  max_hints integer not null default 2,
  points_per_correct_click integer not null default 50,
  penalty_per_wrong_click integer not null default 10,
  penalty_per_hint integer not null default 20,
  allowed_plans public.plan_slug[] not null default array['standard']::public.plan_slug[],
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.image_hunt_targets (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.image_hunt_exercises(id) on delete cascade,
  label_ta text not null,
  label_translation jsonb not null,
  description_ta text,
  description_translation jsonb,
  category text,
  shape text not null default 'rectangle',
  coordinates jsonb not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.image_hunt_prompts (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.image_hunt_exercises(id) on delete cascade,
  instruction text not null,
  instruction_ta text not null,
  instruction_translation jsonb not null,
  prompt_type text not null default 'single_target',
  expected_category text,
  order_index integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.image_hunt_prompt_targets (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references public.image_hunt_prompts(id) on delete cascade,
  target_id uuid not null references public.image_hunt_targets(id) on delete cascade,
  is_required boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.image_hunt_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  exercise_id uuid not null references public.image_hunt_exercises(id) on delete cascade,
  score integer not null default 0,
  total_targets integer not null default 0,
  found_targets integer not null default 0,
  wrong_clicks integer not null default 0,
  hints_used integer not null default 0,
  time_used_seconds integer not null default 0,
  completed_at timestamptz not null default now()
);

create table if not exists public.image_hunt_user_clicks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  exercise_id uuid not null references public.image_hunt_exercises(id) on delete cascade,
  prompt_id uuid,
  target_id uuid,
  clicked_x numeric(8,2) not null,
  clicked_y numeric(8,2) not null,
  is_correct boolean not null default false,
  clicked_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  plan_id uuid not null references public.subscription_plans(id) on delete restrict,
  amount numeric(10,2) not null,
  currency text not null default 'EUR',
  status text not null,
  payment_provider text not null default 'stripe',
  provider_payment_id text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, email, preferred_language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'preferred_language', 'en')
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
