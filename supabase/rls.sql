alter table public.profiles enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.word_search_scores enable row level security;
alter table public.fill_blank_scores enable row level security;
alter table public.fill_blank_user_answers enable row level security;
alter table public.image_hunt_scores enable row level security;
alter table public.image_hunt_user_clicks enable row level security;
alter table public.payments enable row level security;

create policy "profiles_select_self_or_admin"
on public.profiles for select
using (auth.uid() = user_id or exists (
  select 1 from public.profiles admin_profile
  where admin_profile.user_id = auth.uid() and admin_profile.role = 'admin'
));

create policy "profiles_update_self"
on public.profiles for update
using (auth.uid() = user_id);

create policy "subscriptions_select_self_or_admin"
on public.user_subscriptions for select
using (auth.uid() = user_id or exists (
  select 1 from public.profiles admin_profile
  where admin_profile.user_id = auth.uid() and admin_profile.role = 'admin'
));

create policy "scores_select_self"
on public.word_search_scores for select
using (auth.uid() = user_id);

create policy "scores_insert_self"
on public.word_search_scores for insert
with check (auth.uid() = user_id);

create policy "fill_scores_select_self"
on public.fill_blank_scores for select
using (auth.uid() = user_id);

create policy "fill_scores_insert_self"
on public.fill_blank_scores for insert
with check (auth.uid() = user_id);

create policy "fill_answers_select_self"
on public.fill_blank_user_answers for select
using (auth.uid() = user_id);

create policy "fill_answers_insert_self"
on public.fill_blank_user_answers for insert
with check (auth.uid() = user_id);

create policy "image_scores_select_self"
on public.image_hunt_scores for select
using (auth.uid() = user_id);

create policy "image_scores_insert_self"
on public.image_hunt_scores for insert
with check (auth.uid() = user_id);

create policy "image_clicks_select_self"
on public.image_hunt_user_clicks for select
using (auth.uid() = user_id);

create policy "image_clicks_insert_self"
on public.image_hunt_user_clicks for insert
with check (auth.uid() = user_id);

create policy "payments_select_self_or_admin"
on public.payments for select
using (auth.uid() = user_id or exists (
  select 1 from public.profiles admin_profile
  where admin_profile.user_id = auth.uid() and admin_profile.role = 'admin'
));
