-- Run in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to run more than once.

create table if not exists shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz default now()
);

create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references shops(id) on delete cascade,
  visitor_name text not null,
  visit_date date not null default current_date,
  drink_ordered text,
  notes text,
  photo_url text,
  rating_coffee numeric(2,1),
  rating_atmosphere numeric(2,1),
  rating_food numeric(2,1),
  rating_service numeric(2,1),
  created_at timestamptz default now()
);

create index if not exists visits_shop_id_idx on visits(shop_id);

-- Google Places ID for shops picked from Google search (null for hand-dropped pins).
alter table shops add column if not exists google_place_id text;

-- No auth: anyone with the app (the anon key) can read, add, edit and delete.
-- Newer Supabase projects don't auto-grant table access to the API roles.
grant usage on schema public to anon;
grant select, insert, update, delete on table shops, visits to anon;

alter table shops enable row level security;
alter table visits enable row level security;

drop policy if exists "anon read shops" on shops;
create policy "anon read shops" on shops for select to anon using (true);
drop policy if exists "anon insert shops" on shops;
create policy "anon insert shops" on shops for insert to anon with check (true);
drop policy if exists "anon read visits" on visits;
create policy "anon read visits" on visits for select to anon using (true);
drop policy if exists "anon insert visits" on visits;
create policy "anon insert visits" on visits for insert to anon with check (true);

drop policy if exists "anon update shops" on shops;
create policy "anon update shops" on shops for update to anon using (true) with check (true);
drop policy if exists "anon delete shops" on shops;
create policy "anon delete shops" on shops for delete to anon using (true);
drop policy if exists "anon update visits" on visits;
create policy "anon update visits" on visits for update to anon using (true) with check (true);
drop policy if exists "anon delete visits" on visits;
create policy "anon delete visits" on visits for delete to anon using (true);

-- Public bucket for visit photos.
insert into storage.buckets (id, name, public)
values ('visit-photos', 'visit-photos', true)
on conflict (id) do nothing;

drop policy if exists "anon upload visit photos" on storage.objects;
create policy "anon upload visit photos" on storage.objects
  for insert to anon with check (bucket_id = 'visit-photos');
drop policy if exists "anon read visit photos" on storage.objects;
create policy "anon read visit photos" on storage.objects
  for select to anon using (bucket_id = 'visit-photos');
drop policy if exists "anon delete visit photos" on storage.objects;
create policy "anon delete visit photos" on storage.objects
  for delete to anon using (bucket_id = 'visit-photos');
