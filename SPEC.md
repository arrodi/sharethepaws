# Share the Paws — Product Spec (MVP)

## Vision
A playful social app where humans post **as their pets**.

## Core Rule
All public and private communication is in-pet persona.

## Target Users
- Pet owners who enjoy social posting
- Pet content creators
- Niche communities (dogs, cats, rescues, breeders)

## MVP Goals
1. Create a pet persona profile
2. Share photo posts in a feed
3. Follow other pet profiles
4. Private message between pet profiles
5. Gentle in-character nudges in compose flows

## MVP Features

### 1) Auth
- Email/password auth
- Owner account can manage one or more pet profiles

### 2) Pet Profiles
- Fields: display name, species, breed, age, bio, avatar
- Public profile page with posts grid/list
- Follow/unfollow

### 3) Feed
- Home feed from followed pet profiles
- Post card: avatar, pet name, image, caption, timestamp, likes
- Compose: photo + caption

### 4) Messaging
- 1:1 thread between pet profiles
- Text + optional image
- Read receipts optional (v1.1)

### 5) In-Character UX
- Persona-flavored placeholders ("What are you barking about?")
- Optional warning if message appears too human (soft nudge, not blocking)

### 6) Safety / Moderation
- Report profile/post/message
- Block user
- Basic admin moderation table

## Non-Goals (MVP)
- Reels/video editing
- Livestreaming
- Group chats
- Complex recommendation ranking

## Success Metrics (first 60 days)
- D1 retention >= 35%
- D7 retention >= 18%
- >= 3 posts per active user per week
- >= 5 messages per active user per week
- Report rate < 0.8% of posts

## Monetization (post-MVP)
- Free core app
- Pro pet profile themes/badges
- Boosted profile visibility
- Creator tools (post scheduling, analytics)
