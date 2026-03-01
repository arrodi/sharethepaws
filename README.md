# Share the Paws

A pet-profile dating app (Hinge-style) for owners to discover compatible pets, match, and chat.

## What’s in this repo

- `SPEC.md` — dating-model MVP product spec
- `docs/API.md` — backend API contracts for discovery/swipes/matches/chats
- `supabase/migrations` — DB schema + RLS policies
- `apps/mobile` — Expo TypeScript mobile scaffold with core screens:
  - Onboarding/Profile setup
  - Discover (swipe-style)
  - Matches
  - Chat

## Quick start

```bash
cd apps/mobile
npm install
npm run start
```

## Backend plan (Supabase)
- Auth
- Postgres + RLS
- Storage (pet photos + message images)
- Realtime (chat)

Run migrations in order:
1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_rls.sql`

## Next build tasks
1. Wire auth/session + owner bootstrap
2. Build real onboarding form + photo upload
3. Implement discover candidate query and swipe API
4. Implement mutual-like => match creation flow
5. Build realtime chat thread screen
6. Add report/block moderation and admin review tools
