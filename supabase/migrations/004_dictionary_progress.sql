create table if not exists public.dictionary_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_id uuid not null references public.dictionary_entries(id) on delete cascade,
  views_count integer not null default 0,
  learned_count integer not null default 0,
  last_seen_day bigint,
  last_learned_day bigint,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_id)
);

create index if not exists dictionary_progress_user_id_idx
  on public.dictionary_progress(user_id);

create index if not exists dictionary_progress_entry_id_idx
  on public.dictionary_progress(entry_id);

alter table public.dictionary_progress enable row level security;

drop policy if exists "dictionary_progress_select_own" on public.dictionary_progress;
create policy "dictionary_progress_select_own"
  on public.dictionary_progress
  for select
  using (auth.uid() = user_id);

drop policy if exists "dictionary_progress_insert_own" on public.dictionary_progress;
create policy "dictionary_progress_insert_own"
  on public.dictionary_progress
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "dictionary_progress_update_own" on public.dictionary_progress;
create policy "dictionary_progress_update_own"
  on public.dictionary_progress
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists set_dictionary_progress_updated_at on public.dictionary_progress;
create trigger set_dictionary_progress_updated_at
before update on public.dictionary_progress
for each row
execute function public.set_updated_at();
