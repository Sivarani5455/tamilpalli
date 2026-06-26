create table if not exists public.dictionary_entries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dictionary_translations (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.dictionary_entries(id) on delete cascade,
  locale text not null,
  word text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entry_id, locale)
);

create index if not exists dictionary_entries_slug_idx
  on public.dictionary_entries (slug);

create index if not exists dictionary_translations_locale_idx
  on public.dictionary_translations (locale);

create index if not exists dictionary_translations_word_idx
  on public.dictionary_translations (word);
