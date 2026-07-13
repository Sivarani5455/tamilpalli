alter table public.word_search_grids
  add column if not exists publish_date date;

create index if not exists word_search_grids_publish_date_idx
  on public.word_search_grids (publish_date, is_active);

comment on column public.word_search_grids.publish_date is
  'Optional first public visibility date. Null means immediately available.';
