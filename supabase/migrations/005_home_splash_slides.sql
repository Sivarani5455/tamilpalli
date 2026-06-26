create table if not exists public.home_splash_slides (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('intro', 'fullscreen')),
  image_url text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists home_splash_slides_sort_order_idx
  on public.home_splash_slides (sort_order asc, created_at asc);

create or replace function public.set_home_splash_slides_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_home_splash_slides_updated_at on public.home_splash_slides;

create trigger trg_home_splash_slides_updated_at
before update on public.home_splash_slides
for each row
execute function public.set_home_splash_slides_updated_at();

insert into public.home_splash_slides (kind, image_url, sort_order, is_active)
select 'intro', '/thiruvalluvar-splash.png', 0, true
where not exists (
  select 1
  from public.home_splash_slides
  where image_url = '/thiruvalluvar-splash.png'
);

insert into public.home_splash_slides (kind, image_url, sort_order, is_active)
select 'fullscreen', image_url, sort_order, true
from (
  values
    ('/thiruvalluvar-splash-2.png', 1),
    ('/thiruvalluvar-splash-3.png', 2),
    ('/thiruvalluvar-splash-4.png', 3),
    ('/thiruvalluvar-splash-5.png', 4)
) as seed(image_url, sort_order)
where not exists (
  select 1
  from public.home_splash_slides existing
  where existing.image_url = seed.image_url
);
