alter table public.dictionary_entries
  add column if not exists category text,
  add column if not exists subcategory text;

create index if not exists dictionary_entries_category_idx
  on public.dictionary_entries (category);

create index if not exists dictionary_entries_subcategory_idx
  on public.dictionary_entries (subcategory);
