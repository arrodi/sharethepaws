-- RLS policies for dating MVP
alter table public.owners enable row level security;
alter table public.pets enable row level security;
alter table public.pet_photos enable row level security;
alter table public.pet_preferences enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.match_participants enable row level security;
alter table public.match_messages enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;

-- owners
create policy if not exists owners_self_select on public.owners for select using (id = auth.uid());
create policy if not exists owners_self_insert on public.owners for insert with check (id = auth.uid());

-- pets
create policy if not exists pets_public_read on public.pets for select using (true);
create policy if not exists pets_owner_write on public.pets for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

-- photos
create policy if not exists photos_public_read on public.pet_photos for select using (true);
create policy if not exists photos_owner_write on public.pet_photos for all
using (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid()))
with check (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid()));

-- preferences
create policy if not exists prefs_public_read on public.pet_preferences for select using (true);
create policy if not exists prefs_owner_write on public.pet_preferences for all
using (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid()))
with check (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid()));

-- swipes
create policy if not exists swipes_owner_rw on public.swipes for all
using (exists (select 1 from public.pets p where p.id = actor_pet_id and p.owner_id = auth.uid()))
with check (exists (select 1 from public.pets p where p.id = actor_pet_id and p.owner_id = auth.uid()));

-- matches and participants visible only to participant owners
create policy if not exists matches_participant_read on public.matches for select
using (
  exists (
    select 1 from public.pets p
    where p.owner_id = auth.uid() and (p.id = matches.pet_a_id or p.id = matches.pet_b_id)
  )
);

create policy if not exists participants_participant_read on public.match_participants for select
using (
  exists (
    select 1 from public.match_participants mp
    join public.pets p on p.id = mp.pet_id
    where mp.match_id = match_participants.match_id and p.owner_id = auth.uid()
  )
);

-- messages
create policy if not exists messages_participant_read on public.match_messages for select
using (
  exists (
    select 1 from public.match_participants mp
    join public.pets p on p.id = mp.pet_id
    where mp.match_id = match_messages.match_id and p.owner_id = auth.uid()
  )
);

create policy if not exists messages_sender_owner_insert on public.match_messages for insert
with check (
  exists (select 1 from public.pets p where p.id = sender_pet_id and p.owner_id = auth.uid())
);

-- blocks
create policy if not exists blocks_owner_rw on public.blocks for all
using (blocker_owner_id = auth.uid())
with check (blocker_owner_id = auth.uid());

-- reports
create policy if not exists reports_insert_authenticated on public.reports for insert with check (auth.uid() is not null);
create policy if not exists reports_read_none on public.reports for select using (false);
