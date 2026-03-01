# Share the Paws — API Contracts (v1)

Backend target: Supabase (Postgres + Auth + Storage + Realtime)

## Auth
- Supabase Auth email/password
- Session JWT used for API and RLS

## Entities
- owners (maps auth.user)
- pets
- follows
- posts
- post_likes
- dm_threads
- dm_participants
- dm_messages
- reports

## Endpoints / Functions (logical)

### Pets
- `GET /pets/:id`
- `PATCH /pets/:id` (owner only)
- `POST /pets` (owner creates)
- `GET /pets/:id/posts`

### Follow
- `POST /pets/:id/follow`
- `DELETE /pets/:id/follow`
- `GET /pets/:id/followers`
- `GET /pets/:id/following`

### Feed / Posts
- `GET /feed?pet_id=...&cursor=...`
- `POST /posts` body: `{ pet_id, image_path, caption }`
- `DELETE /posts/:id` (owner of pet only)
- `POST /posts/:id/like`
- `DELETE /posts/:id/like`

### DMs
- `POST /dm/threads` body: `{ pet_a_id, pet_b_id }`
- `GET /dm/threads?pet_id=...`
- `GET /dm/threads/:id/messages?cursor=...`
- `POST /dm/threads/:id/messages` body: `{ sender_pet_id, text, image_path? }`

### Reports
- `POST /reports` body: `{ reporter_pet_id, target_type, target_id, reason }`

## Validation Rules
- Caption length <= 500
- Message length <= 1500
- Pet display name 2..32 chars
- Species required

## Realtime
- Subscribe to `dm_messages` by thread id
- Subscribe to likes/comments counters (optional v1.1)

## Pagination
- Cursor-based using `created_at` + `id`

## Error Shape
```json
{
  "error": {
    "code": "string",
    "message": "string"
  }
}
```
