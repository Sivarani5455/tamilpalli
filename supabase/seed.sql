insert into public.subscription_plans (name, slug, price, currency, duration_days, description)
values
  ('Discovery', 'discovery', 9.99, 'EUR', 30, 'Essential Tamil vocabulary and starter games.'),
  ('Standard', 'standard', 14.99, 'EUR', 30, 'Balanced plan with grammar and image-based exercises.'),
  ('Elite', 'elite', 29.99, 'EUR', 30, 'Complete premium access and advanced content.');

insert into public.content_categories (title, slug, description, type)
values
  ('Word Search', 'word-search', 'Interactive Tamil word grid challenges.', 'word_search'),
  ('Fill in the Blanks', 'fill-in-the-blanks', 'Tamil sentence completion exercises.', 'fill_in_the_blanks'),
  ('Image Hunt', 'image-hunt', 'Spot the correct Tamil-labelled targets.', 'image_hunt');
