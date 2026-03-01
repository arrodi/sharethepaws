# Share the Paws

A social app where pet owners post and message **as their pets**.

## What’s in this repo

- `SPEC.md` — MVP product spec
- `docs/API.md` — backend API contracts
- `supabase/migrations` — initial DB schema + baseline RLS policies
- `apps/mobile` — Expo TypeScript mobile scaffold with core screens:
  - Auth
  - Pet Profile
  - Feed
  - DMs

## Quick start

```bash
cd apps/mobile
npm install
npm run start
```

## Backend plan

Use Supabase for:
- Auth
- Postgres + RLS
- Storage (images)
- Realtime (DMs)

Run migrations in order:
1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_rls.sql`

## Next build tasks

1. Wire Supabase auth/session in mobile app
2. Implement pet profile CRUD and image upload
3. Implement feed queries + post creation
4. Implement DM thread list and real-time message stream
5. Add report/block moderation flows
