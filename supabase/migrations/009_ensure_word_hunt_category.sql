insert into public.content_categories (title, slug, description, type, is_active)
values (
  'Word Hunt',
  'word-hunt',
  'Race the clock and tap every Tamil word matching the prompt.',
  'word_hunt',
  true
)
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  type = excluded.type,
  is_active = excluded.is_active,
  updated_at = now();
