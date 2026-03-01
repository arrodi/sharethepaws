# Share the Paws — API Contracts (Dating MVP)

Backend target: Supabase (Auth + Postgres + Storage + Realtime)

## Auth
- Supabase email/password auth
- JWT-backed row-level security

## Domain Model
- owners
- pets
- pet_photos
- pet_preferences
- swipes
- matches
- match_participants
- match_messages
- blocks
- reports

## Logical Endpoints

### Owner / Pet Setup
- `POST /pets` create pet profile
- `PATCH /pets/:id` update pet profile
- `GET /pets/:id` get profile
- `POST /pets/:id/photos` add photo
- `DELETE /pets/:id/photos/:photoId`
- `PUT /pets/:id/preferences`

### Discovery
- `GET /discover?pet_id=...&cursor=...`
  - returns candidate cards excluding blocked/matched/already-swiped as configured
- `POST /swipes`
  - body: `{ actor_pet_id, target_pet_id, decision: "pass"|"like", comment? }`
  - if mutual like, server creates match

### Matches
- `GET /matches?pet_id=...`
- `DELETE /matches/:id` (unmatch)

### Messaging
- `GET /matches/:id/messages?cursor=...`
- `POST /matches/:id/messages`
  - body: `{ sender_pet_id, text, image_path? }`

### Safety
- `POST /blocks` body: `{ blocker_owner_id, blocked_owner_id }`
- `DELETE /blocks/:id`
- `POST /reports` body: `{ reporter_owner_id, target_type, target_id, reason, notes? }`

## Validation
- pet bio <= 500 chars
- message text <= 1500 chars
- swipe comment <= 300 chars
- photos: max 6 per pet

## Pagination
- Cursor-based with `(created_at, id)`

## Error Shape
```json
{
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

## Realtime
- Subscribe to `match_messages` by match id
- Optional unread count stream by pet_id (v1.1)
