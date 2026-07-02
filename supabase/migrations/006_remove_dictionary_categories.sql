drop index if exists public.dictionary_entries_category_idx;
drop index if exists public.dictionary_entries_subcategory_idx;

alter table public.dictionary_entries
  drop column if exists category,
  drop column if exists subcategory;
