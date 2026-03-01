-- Share the Paws initial schema
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
  bio text,
  avatar_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.follows (
  follower_pet_id uuid not null references public.pets(id) on delete cascade,
  followee_pet_id uuid not null references public.pets(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_pet_id, followee_pet_id),
  check (follower_pet_id <> followee_pet_id)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  image_path text not null,
  caption text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, pet_id)
);

create table if not exists public.dm_threads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists public.dm_participants (
  thread_id uuid not null references public.dm_threads(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (thread_id, pet_id)
);

create table if not exists public.dm_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.dm_threads(id) on delete cascade,
  sender_pet_id uuid not null references public.pets(id) on delete cascade,
  text text not null default '',
  image_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_pet_id uuid references public.pets(id) on delete set null,
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_pets_owner on public.pets(owner_id);
create index if not exists idx_posts_pet_created on public.posts(pet_id, created_at desc);
create index if not exists idx_messages_thread_created on public.dm_messages(thread_id, created_at desc);
