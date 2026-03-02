-- Local parity additions for current app runtime

CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGSERIAL PRIMARY KEY,
  owner_id TEXT NOT NULL,
  profile_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS owner_profiles (
  owner_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  age_label TEXT,
  city TEXT,
  bio TEXT,
  preferred_species TEXT,
  max_distance_km INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
