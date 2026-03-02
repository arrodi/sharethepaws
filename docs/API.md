# Share the Paws — Local API Contracts

Base URL: `http://localhost:4000`

## Auth

### `POST /auth/mock-login`
Creates a local session and returns bearer token.

Body:
```json
{ "email": "demo@sharethepaws.local" }
```

Response:
```json
{ "token": "local-...", "ownerId": "owner-demo-sharethepaws-local" }
```

Use this token on protected routes:
`Authorization: Bearer <token>`

## Health

### `GET /health`
Checks Postgres + Redis reachability.

## Owner Profile

### `GET /me/profile` (auth)
Returns current owner pet profile.

### `POST /me/profile` (auth)
Upserts owner pet profile.

Body:
```json
{
  "displayName": "Luna",
  "species": "cat",
  "breed": "Maine Coon",
  "ageLabel": "3y",
  "city": "Berlin",
  "bio": "Window seat specialist",
  "preferredSpecies": "dog",
  "maxDistanceKm": 8
}
```

## Discovery + Swipes

### `GET /discover` (auth)
Returns discover cards. If profile preferences exist, filters by:
- `preferredSpecies`
- `maxDistanceKm`

### `POST /swipe` (auth)
Body:
```json
{ "profileId": "pet-1", "direction": "left" }
```
- `left` creates/keeps a match (chat row)
- `right` is pass only

## Matches / Chats

### `GET /chats` (auth)
Returns match list with preview metadata:
- `lastMessage`
- `lastMessageAt`
- `unreadCount`

### `GET /chat/messages?profileId=pet-1` (auth)
Returns message thread.

### `POST /chat/messages` (auth)
Body:
```json
{ "profileId": "pet-1", "text": "Hi!" }
```
Saves owner message and appends pet auto-reply.

### `POST /chat/read` (auth)
Body:
```json
{ "profileId": "pet-1" }
```
Marks pet messages as read.

## Local Dev Admin Tools

### `POST /admin/generate-fake-profiles` (auth)
Generates seeded discover profiles in Postgres + uploads photos to MinIO.

### `POST /admin/reset-fake-profiles` (auth)
Clears generated discover/chat data and profile objects in MinIO.
