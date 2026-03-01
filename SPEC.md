# Share the Paws — Product Spec (Dating Pivot)

## Vision
A Hinge-style dating and playdate app for pet owners, using pet profiles as the primary identity.

## Core Value
Help owners discover **compatible pets nearby**, match, and start conversations to arrange walks/playdates.

## Product Positioning
- Not pet social media
- Not generic human dating
- **Pet compatibility-first matching** with owner context for practical meetups

## MVP Goals
1. Create complete pet dating profile
2. Swipe-style discovery with pass/like (and optional comment-like)
3. Mutual likes create matches
4. Matched users can chat
5. Safety controls: report/block/unmatch

## Target Users
- Urban/suburban pet owners looking for socialization/playdates
- Owners seeking pet companionship opportunities
- New pet owners looking to meet similar nearby pets

## Core User Flows

### A) Onboarding
1. Create owner account
2. Add pet profile (name/species/breed/age/sex/size)
3. Add photos (3–6)
4. Set preferences (species, size, age range, distance)
5. Enter city/approximate location

### B) Discovery
- View one profile card at a time
- Actions:
  - Pass
  - Like
  - Like with comment on a photo/prompt
- If mutual like → Match created

### C) Matches + Chat
- Match list sorted by latest activity
- Open chat thread
- Send text + optional image
- Use suggested icebreakers

### D) Trust & Safety
- Report profile/message
- Block user
- Unmatch to end connection

## MVP Features

### 1) Account & Identity
- Email/password auth
- Owner account can manage one or more pets (v1 can enforce one active pet)

### 2) Pet Profile
- Required: display name, species, age label, sex, size, bio, location
- Optional: breed, temperament tags
- Photos: minimum 3, maximum 6

### 3) Discovery Feed
- Candidate profile cards from matching pool
- Filter baseline:
  - max distance
  - species preference
  - age/size preference
- Action state tracked for each direction (like/pass)

### 4) Matching Engine (MVP-simple)
- Mutual like only
- No advanced ranking in MVP
- Candidate exclusions:
  - blocked users
  - previously passed (optional re-surface window)
  - already matched

### 5) Messaging
- Threads only for matched pairs
- Message types: text (+ image optional)
- Read receipts optional (v1.1)

### 6) Moderation
- Report reasons (fake profile, harassment, scam, inappropriate content)
- Block at owner level
- Admin-reviewable report table

## Non-Goals (MVP)
- Video stories/reels
- Group chats
- AI compatibility scoring
- Subscription payments in-app (enable after traction)

## UX Principles
- Swipe-first, low cognitive load
- Profile depth like Hinge (prompt-driven personality), but pet context
- Practical over performative (distance/schedule context)

## Success Metrics (first 90 days)
- Onboarding completion rate >= 60%
- Daily swipe sessions/user >= 1.3
- Match rate >= 15% of likes
- % matches with first message >= 55%
- D7 retention >= 20%

## Monetization (post-MVP)
- Free core
- Premium tier:
  - extra daily likes
  - advanced filters
  - who liked you
  - profile boost
  - rewind
