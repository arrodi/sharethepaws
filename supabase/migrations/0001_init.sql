-- Share the Paws dating MVP schema
create extension if not exists "pgcrypto";

create table if not exists public.owners (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.owners(id) on delete cascade,
  display_name text not null,
  species text not null,
  breed text,
  age_label text,
  sex text,
  size text,
  bio text,
  city text,
  location_lat double precision,
  location_lng double precision,
  created_at timestamptz not null default now()
);

create table if not exists public.pet_photos (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  image_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.pet_preferences (
  pet_id uuid primary key references public.pets(id) on delete cascade,
  preferred_species text[],
  preferred_sizes text[],
  min_age_months int,
  max_age_months int,
  max_distance_km int not null default 20,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.swipes (
  id uuid primary key default gen_random_uuid(),
  actor_pet_id uuid not null references public.pets(id) on delete cascade,
  target_pet_id uuid not null references public.pets(id) on delete cascade,
  decision text not null check (decision in ('pass','like')),
  comment text,
  created_at timestamptz not null default now(),
  unique (actor_pet_id, target_pet_id)
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  pet_a_id uuid not null references public.pets(id) on delete cascade,
  pet_b_id uuid not null references public.pets(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (pet_a_id, pet_b_id),
  check (pet_a_id <> pet_b_id)
);

create table if not exists public.match_participants (
  match_id uuid not null references public.matches(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (match_id, pet_id)
);

create table if not exists public.match_messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  sender_pet_id uuid not null references public.pets(id) on delete cascade,
  text text not null default '',
  image_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_owner_id uuid not null references public.owners(id) on delete cascade,
  blocked_owner_id uuid not null references public.owners(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_owner_id, blocked_owner_id),
  check (blocker_owner_id <> blocked_owner_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_owner_id uuid references public.owners(id) on delete set null,
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_pets_owner on public.pets(owner_id);
create index if not exists idx_swipes_actor_created on public.swipes(actor_pet_id, created_at desc);
create index if not exists idx_matches_pet_a on public.matches(pet_a_id);
create index if not exists idx_matches_pet_b on public.matches(pet_b_id);
create index if not exists idx_messages_match_created on public.match_messages(match_id, created_at desc);
