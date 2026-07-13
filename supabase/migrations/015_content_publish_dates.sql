do $$
begin
  if to_regclass('public.fill_blank_exercises') is not null then
    alter table public.fill_blank_exercises
      add column if not exists publish_date date;

    create index if not exists fill_blank_exercises_publish_date_idx
      on public.fill_blank_exercises (publish_date, is_active);
  end if;

  if to_regclass('public.image_hunt_exercises') is not null then
    alter table public.image_hunt_exercises
      add column if not exists publish_date date;

    create index if not exists image_hunt_exercises_publish_date_idx
      on public.image_hunt_exercises (publish_date, is_active);
  end if;

  if to_regclass('public.word_hunt_exercises') is not null then
    alter table public.word_hunt_exercises
      add column if not exists publish_date date;

    create index if not exists word_hunt_exercises_publish_date_idx
      on public.word_hunt_exercises (publish_date, is_active);
  end if;

  if to_regclass('public.kathaigal_stories') is not null then
    alter table public.kathaigal_stories
      add column if not exists publish_date date;

    create index if not exists kathaigal_stories_publish_date_idx
      on public.kathaigal_stories (publish_date, is_active);
  end if;
end
$$;
