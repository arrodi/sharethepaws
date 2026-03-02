# Auth & Session Flow (Simple Explanation)

This document explains how authentication currently works in Share the Paws local API.

---

## TL;DR

- Client logs in at `POST /auth/mock-login`
- Server returns a session token
- Client sends token in `Authorization: Bearer <token>`
- Auth middleware validates token in Redis
- Middleware sets `req.ownerId`
- Protected routes use `req.ownerId` (not client-provided ownerId)

---

## Why this exists

Without this flow, a client could send any `ownerId` in request JSON and impersonate another user.

With this flow, identity is derived by the server from the session token stored in Redis.

---

## Sequence Diagram

```mermaid
sequenceDiagram
  participant App as Mobile App
  participant API as Express API
  participant Redis as Redis

  App->>API: POST /auth/mock-login (email)
  API->>Redis: SET session:<token> = ownerId (TTL 7d)
  API-->>App: { token, ownerId }

  App->>API: GET /discover\nAuthorization: Bearer <token>
  API->>Redis: GET session:<token>
  Redis-->>API: ownerId
  API->>API: middleware sets req.ownerId
  API-->>App: profiles
```

---

## Request Lifecycle for Protected Routes

```mermaid
flowchart TD
  A[Incoming request] --> B{Has Authorization header?}
  B -- No --> E[401 missing_auth_token]
  B -- Yes --> C{Bearer token valid in Redis?}
  C -- No --> F[401 invalid_or_expired_session]
  C -- Yes --> D[Set req.ownerId from Redis]
  D --> G[Run route handler]
  G --> H[Use req.ownerId in DB queries]
  H --> I[Return response]
```

---

## Middleware behavior

The auth middleware does three things:

1. Parse `Authorization` header
2. Validate token against Redis session store
3. Attach `req.ownerId` for downstream handlers

If validation fails, request stops with `401`.

---

## Protected endpoints (current)

These endpoints require Bearer auth and rely on `req.ownerId`:

- `GET /me/profile`
- `POST /me/profile`
- `GET /discover`
- `POST /swipe`
- `GET /chats`
- `GET /chat/messages`
- `POST /chat/messages`
- `POST /chat/read`
- `POST /admin/generate-fake-profiles`
- `POST /admin/reset-fake-profiles`

---

## Important security rule

Do **not** trust client-submitted `ownerId` for protected operations.

Correct pattern:

- derive owner identity from token in middleware
- use `req.ownerId` everywhere

---

## Practical troubleshooting

If you see `missing_auth_token`:

- app did not set token after login, or
- request was sent before login, or
- request path is protected but client used plain `fetch` without auth wrapper

If you see `invalid_or_expired_session`:

- Redis was restarted (sessions gone), or
- token expired, or
- stale token in app

Fix: login again and retry.
