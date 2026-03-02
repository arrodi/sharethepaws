# Share the Paws

A pet-profile dating app (Hinge-style) for owners to discover compatible pets, match, and chat.

## What’s in this repo

- `SPEC.md` — dating-model MVP product spec
- `docs/API.md` — backend API contracts for discovery/swipes/matches/chats
- `supabase/migrations` — DB schema + RLS policies
- `apps/mobile` — Expo app
- `apps/server` — local API (Postgres + Redis + MinIO)
- `docker-compose.yml` — local infra (Postgres/Redis/MinIO)

## Quick start (recommended)

```bash
docker compose up -d
npm run dev:start
```

Then start mobile in a second terminal:

```bash
npm run dev:mobile
```

## Environment variables

- Server env: `apps/server/.env.example`
- Mobile env: `apps/mobile/.env.example`

## Scripts

- `npm run dev:server` — start API server
- `npm run dev:mobile` — start Expo app
- `npm run dev:all` — start both
- `npm run dev:start` — boot + health-check API
- `npm run smoke` — end-to-end smoke test (profile → discover → swipe → chat)

## Notes

- API endpoints requiring auth now use `Authorization: Bearer <token>` from `/auth/mock-login`.
- Discover is filtered by owner profile preferences (`preferredSpecies`, `maxDistanceKm`) when set.
- Matches/chat list now returns `lastMessage`, `lastMessageAt`, and `unreadCount`.
