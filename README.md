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

## Quick start (local infra)

### 1) Start local services
- Postgres on `localhost:5432`
- Redis on `localhost:6379`
- MinIO on `localhost:9000` (API) and `localhost:9001` (console)

### 2) Start API server
```bash
cd apps/server
cp .env.example .env
npm install
npm run start
```

### 3) Start mobile app
```bash
cd apps/mobile
cp .env.example .env
npm install
npm run start
```

### Environment variables
- Server env: `apps/server/.env.example`
- Mobile env: `apps/mobile/.env.example`

## Backend notes
This repo now includes a local API service wired to:
- PostgreSQL (chat persistence)
- Redis (session token state)
- MinIO (bucket initialization for image storage)

Supabase migration files remain in `supabase/migrations` for hosted path/reference.
