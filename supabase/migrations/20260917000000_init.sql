-- Acque Dolci — initial schema, RLS policies, and storage buckets.
-- See acque-dolci-spec.md for the product spec this implements.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  avatar_url text,
  bio text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table public.spots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  description text,
  latitude float8 not null,
  longitude float8 not null,
  water_body_name text not null,
  is_mapped_river boolean not null default true,
  access_notes text,
  created_at timestamptz not null default now()
);

create table public.spot_photos (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.spots (id) on delete cascade,
  photo_url text not null,
  uploaded_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.fish_species (
  id serial primary key,
  name text not null unique,
  scientific_name text
);

create table public.catches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  spot_id uuid references public.spots (id) on delete set null,
  species_id int not null references public.fish_species (id),
  weight_kg float8,
  length_cm float8,
  caught_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create table public.catch_photos (
  id uuid primary key default gen_random_uuid(),
  catch_id uuid not null references public.catches (id) on delete cascade,
  photo_url text not null
);

create table public.temperature_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  spot_id uuid references public.spots (id) on delete set null,
  water_body_name text not null,
  temperature_celsius float8 not null,
  recorded_at timestamptz not null default now(),
  latitude float8,
  longitude float8
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  slug text not null unique,
  cover_image_url text,
  content text not null,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.forum_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category text not null check (category in ('Attrezzatura', 'Tecniche', 'Normative', 'Spot e zone')),
  title text not null,
  created_at timestamptz not null default now(),
  pinned boolean not null default false
);

create table public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.forum_threads (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index spots_user_id_idx on public.spots (user_id);
create index catches_user_id_idx on public.catches (user_id);
create index catches_spot_id_idx on public.catches (spot_id);
create index temperature_readings_water_body_idx on public.temperature_readings (water_body_name, recorded_at);
create index forum_posts_thread_id_idx on public.forum_posts (thread_id);
create index blog_posts_published_idx on public.blog_posts (published, published_at desc);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Creates a profile row automatically whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := coalesce(
    nullif(regexp_replace(lower(split_part(new.email, '@', 1)), '[^a-z0-9_]+', '', 'g'), ''),
    'pescatore'
  );
  final_username := base_username;

  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, avatar_url)
  values (new.id, final_username, new.raw_user_meta_data ->> 'avatar_url');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Only admins may change a profile's role, and only admins may set pinned=true.
create or replace function public.enforce_profile_role_immutable()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role <> old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_role_guard on public.profiles;
create trigger profiles_role_guard
  before update on public.profiles
  for each row execute function public.enforce_profile_role_immutable();

create or replace function public.enforce_thread_pin_admin_only()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.pinned <> old.pinned and not public.is_admin() then
    new.pinned := old.pinned;
  end if;
  return new;
end;
$$;

drop trigger if exists forum_threads_pin_guard on public.forum_threads;
create trigger forum_threads_pin_guard
  before update on public.forum_threads
  for each row execute function public.enforce_thread_pin_admin_only();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.spots enable row level security;
alter table public.spot_photos enable row level security;
alter table public.fish_species enable row level security;
alter table public.catches enable row level security;
alter table public.catch_photos enable row level security;
alter table public.temperature_readings enable row level security;
alter table public.blog_posts enable row level security;
alter table public.forum_threads enable row level security;
alter table public.forum_posts enable row level security;

-- profiles: public read, owner (or admin) write
create policy "profiles are publicly readable" on public.profiles
  for select using (true);
create policy "users can update their own profile" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

-- spots: public read, authenticated insert own, owner/admin update+delete
create policy "spots are publicly readable" on public.spots
  for select using (true);
create policy "authenticated users can create spots" on public.spots
  for insert with check (auth.uid() = user_id);
create policy "owners or admins can update spots" on public.spots
  for update using (auth.uid() = user_id or public.is_admin());
create policy "owners or admins can delete spots" on public.spots
  for delete using (auth.uid() = user_id or public.is_admin());

-- spot_photos: public read, authenticated insert as themselves, owner/admin manage
create policy "spot photos are publicly readable" on public.spot_photos
  for select using (true);
create policy "authenticated users can add spot photos" on public.spot_photos
  for insert with check (auth.uid() = uploaded_by);
create policy "uploaders or admins can delete spot photos" on public.spot_photos
  for delete using (auth.uid() = uploaded_by or public.is_admin());

-- fish_species: public read, admin-managed reference data
create policy "fish species are publicly readable" on public.fish_species
  for select using (true);
create policy "admins manage fish species" on public.fish_species
  for all using (public.is_admin()) with check (public.is_admin());

-- catches: public read, authenticated insert own, owner/admin update+delete
create policy "catches are publicly readable" on public.catches
  for select using (true);
create policy "authenticated users can log catches" on public.catches
  for insert with check (auth.uid() = user_id);
create policy "owners or admins can update catches" on public.catches
  for update using (auth.uid() = user_id or public.is_admin());
create policy "owners or admins can delete catches" on public.catches
  for delete using (auth.uid() = user_id or public.is_admin());

-- catch_photos: public read, insert only for catches the user owns
create policy "catch photos are publicly readable" on public.catch_photos
  for select using (true);
create policy "owners can add catch photos" on public.catch_photos
  for insert with check (
    exists (select 1 from public.catches c where c.id = catch_id and c.user_id = auth.uid())
  );
create policy "owners or admins can delete catch photos" on public.catch_photos
  for delete using (
    public.is_admin()
    or exists (select 1 from public.catches c where c.id = catch_id and c.user_id = auth.uid())
  );

-- temperature_readings: public read, authenticated insert own, owner/admin update+delete
create policy "temperature readings are publicly readable" on public.temperature_readings
  for select using (true);
create policy "authenticated users can log temperature readings" on public.temperature_readings
  for insert with check (auth.uid() = user_id);
create policy "owners or admins can update temperature readings" on public.temperature_readings
  for update using (auth.uid() = user_id or public.is_admin());
create policy "owners or admins can delete temperature readings" on public.temperature_readings
  for delete using (auth.uid() = user_id or public.is_admin());

-- blog_posts: published posts are public, admins see/write everything
create policy "published posts are publicly readable" on public.blog_posts
  for select using (published or public.is_admin());
create policy "only admins can create posts" on public.blog_posts
  for insert with check (public.is_admin());
create policy "only admins can update posts" on public.blog_posts
  for update using (public.is_admin());
create policy "only admins can delete posts" on public.blog_posts
  for delete using (public.is_admin());

-- forum_threads: public read, authenticated insert own, owner/admin update+delete
-- (pinned can only actually change for admins, enforced by the trigger above)
create policy "forum threads are publicly readable" on public.forum_threads
  for select using (true);
create policy "authenticated users can start threads" on public.forum_threads
  for insert with check (auth.uid() = user_id);
create policy "owners or admins can update threads" on public.forum_threads
  for update using (auth.uid() = user_id or public.is_admin());
create policy "owners or admins can delete threads" on public.forum_threads
  for delete using (auth.uid() = user_id or public.is_admin());

-- forum_posts: public read, authenticated insert own, owner/admin update+delete
create policy "forum posts are publicly readable" on public.forum_posts
  for select using (true);
create policy "authenticated users can reply" on public.forum_posts
  for insert with check (auth.uid() = user_id);
create policy "owners or admins can update posts" on public.forum_posts
  for update using (auth.uid() = user_id or public.is_admin());
create policy "owners or admins can delete posts" on public.forum_posts
  for delete using (auth.uid() = user_id or public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('spot-photos', 'spot-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('catch-photos', 'catch-photos', true)
on conflict (id) do nothing;

create policy "spot photos are publicly viewable" on storage.objects
  for select using (bucket_id = 'spot-photos');
create policy "authenticated users can upload spot photos" on storage.objects
  for insert with check (bucket_id = 'spot-photos' and auth.role() = 'authenticated');
create policy "owners can delete their spot photos" on storage.objects
  for delete using (bucket_id = 'spot-photos' and owner = auth.uid());

create policy "catch photos are publicly viewable" on storage.objects
  for select using (bucket_id = 'catch-photos');
create policy "authenticated users can upload catch photos" on storage.objects
  for insert with check (bucket_id = 'catch-photos' and auth.role() = 'authenticated');
create policy "owners can delete their catch photos" on storage.objects
  for delete using (bucket_id = 'catch-photos' and owner = auth.uid());

-- ---------------------------------------------------------------------------
-- Reference data
-- ---------------------------------------------------------------------------

insert into public.fish_species (name, scientific_name) values
  ('Trota fario', 'Salmo trutta'),
  ('Trota marmorata', 'Salmo marmoratus'),
  ('Temolo', 'Thymallus thymallus'),
  ('Luccio', 'Esox lucius'),
  ('Barbo', 'Barbus barbus'),
  ('Cavedano', 'Squalius cephalus'),
  ('Salmerino', 'Salvelinus fontinalis'),
  ('Carpa', 'Cyprinus carpio'),
  ('Persico reale', 'Perca fluviatilis'),
  ('Anguilla', 'Anguilla anguilla')
on conflict (name) do nothing;
