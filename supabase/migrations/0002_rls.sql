-- Basic RLS policies
alter table public.owners enable row level security;
alter table public.pets enable row level security;
alter table public.follows enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.dm_threads enable row level security;
alter table public.dm_participants enable row level security;
alter table public.dm_messages enable row level security;
alter table public.reports enable row level security;

-- owners
create policy if not exists owners_self_select on public.owners for select using (id = auth.uid());
create policy if not exists owners_self_insert on public.owners for insert with check (id = auth.uid());

-- pets
create policy if not exists pets_public_read on public.pets for select using (true);
create policy if not exists pets_owner_write on public.pets for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- follows
create policy if not exists follows_public_read on public.follows for select using (true);
create policy if not exists follows_owner_write on public.follows for all
using (exists (select 1 from public.pets p where p.id = follower_pet_id and p.owner_id = auth.uid()))
with check (exists (select 1 from public.pets p where p.id = follower_pet_id and p.owner_id = auth.uid()));

-- posts
create policy if not exists posts_public_read on public.posts for select using (true);
create policy if not exists posts_owner_write on public.posts for all
using (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid()))
with check (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid()));

-- likes
create policy if not exists likes_public_read on public.post_likes for select using (true);
create policy if not exists likes_owner_write on public.post_likes for all
using (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid()))
with check (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid()));

-- dm participants/messages
create policy if not exists dm_participants_read_own_threads on public.dm_participants for select
using (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid()));

create policy if not exists dm_messages_read_by_participant on public.dm_messages for select
using (
  exists (
    select 1 from public.dm_participants dp
    join public.pets p on p.id = dp.pet_id
    where dp.thread_id = dm_messages.thread_id and p.owner_id = auth.uid()
  )
);

create policy if not exists dm_messages_write_sender_owner on public.dm_messages for insert
with check (exists (select 1 from public.pets p where p.id = sender_pet_id and p.owner_id = auth.uid()));

-- reports
create policy if not exists reports_insert_authenticated on public.reports for insert with check (auth.uid() is not null);
create policy if not exists reports_read_none on public.reports for select using (false);
