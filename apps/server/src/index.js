import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import { createClient as createRedisClient } from 'redis';
import { Client as MinioClient } from 'minio';
import crypto from 'node:crypto';
import { seedProfiles } from './profiles.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.API_PORT || 4000);
const pg = new Pool({ connectionString: process.env.POSTGRES_URL || 'postgres://postgresadmin:super_secure_password_987@localhost:5432/sharethepaws-db' });
const redis = createRedisClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });

const minio = new MinioClient({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: Number(process.env.MINIO_PORT || 9000),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});
const MINIO_BUCKET = process.env.MINIO_BUCKET || 'pet-photos';

function getBearerToken(req) {
  const auth = String(req.headers.authorization || '');
  if (!auth.toLowerCase().startsWith('bearer ')) return null;
  return auth.slice(7).trim();
}

async function requireAuth(req, res, next) {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: 'missing_auth_token' });
  const ownerId = await redis.get(`session:${token}`);
  if (!ownerId) return res.status(401).json({ error: 'invalid_or_expired_session' });
  req.ownerId = ownerId;
  next();
}

async function ensureBucket() {
  try {
    const exists = await minio.bucketExists(MINIO_BUCKET);
    if (!exists) await minio.makeBucket(MINIO_BUCKET);
  } catch {
    // non-fatal for local dev
  }
}

async function init() {
  await redis.connect();
  await pg.query(`
    CREATE TABLE IF NOT EXISTS chats (
      id SERIAL PRIMARY KEY,
      owner_id TEXT NOT NULL,
      profile_id TEXT NOT NULL,
      display_name TEXT NOT NULL,
      prompt_preview TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(owner_id, profile_id)
    );
  `);

  await pg.query(`
    CREATE TABLE IF NOT EXISTS discover_profiles (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      species TEXT NOT NULL,
      age_label TEXT NOT NULL,
      bio TEXT NOT NULL,
      distance_km REAL NOT NULL,
      photos JSONB NOT NULL,
      prompts JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pg.query(`
    CREATE TABLE IF NOT EXISTS fake_accounts (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      pet_profile_id TEXT NOT NULL REFERENCES discover_profiles(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pg.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      owner_id TEXT NOT NULL,
      profile_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      read_at TIMESTAMPTZ
    );
  `);

  await pg.query(`
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
  `);

  await ensureBucket();
}

async function uploadRemoteImageToMinio(url, objectName) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`failed_fetch_image:${response.status}`);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await minio.putObject(MINIO_BUCKET, objectName, buffer, buffer.length, {
    'Content-Type': response.headers.get('content-type') || 'image/jpeg',
  });
  return objectName;
}

async function clearProfileObjectsFromMinio() {
  try {
    await ensureBucket();
    const objects = [];
    const stream = minio.listObjectsV2(MINIO_BUCKET, 'profiles/', true);
    await new Promise((resolve, reject) => {
      stream.on('data', (obj) => { if (obj?.name) objects.push(obj.name); });
      stream.on('error', reject);
      stream.on('end', resolve);
    });
    if (objects.length > 0) await minio.removeObjects(MINIO_BUCKET, objects);
  } catch {
    // non-fatal for local dev
  }
}

async function clearGeneratedData() {
  await clearProfileObjectsFromMinio();
  await pg.query('DELETE FROM chat_messages;');
  await pg.query('DELETE FROM chats;');
  await pg.query('DELETE FROM fake_accounts;');
  await pg.query('DELETE FROM discover_profiles;');
}

async function generateProfilesIntoStorageAndDb() {
  await ensureBucket();
  await clearGeneratedData();

  for (const p of seedProfiles) {
    const storedPhotos = [];
    for (let i = 0; i < p.photos.length; i += 1) {
      const sourceUrl = p.photos[i];
      const objectName = `profiles/${p.id}/photo-${i + 1}.jpg`;
      try {
        const saved = await uploadRemoteImageToMinio(sourceUrl, objectName);
        storedPhotos.push(saved);
      } catch {
        storedPhotos.push(sourceUrl);
      }
    }

    await pg.query(
      `INSERT INTO discover_profiles (id, display_name, species, age_label, bio, distance_km, photos, prompts)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb)`,
      [p.id, p.displayName, p.species, p.ageLabel, p.bio, p.distanceKm, JSON.stringify(storedPhotos), JSON.stringify(p.prompts)]
    );

    await pg.query(
      `INSERT INTO fake_accounts (id, email, pet_profile_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, pet_profile_id = EXCLUDED.pet_profile_id`,
      [`owner-${p.id}`, `${p.id}@fake.sharethepaws.local`, p.id]
    );
  }
}

async function getOwnerProfile(ownerId) {
  const { rows } = await pg.query(
    `SELECT display_name as "displayName", species, breed, age_label as "ageLabel", city, bio,
            preferred_species as "preferredSpecies", max_distance_km as "maxDistanceKm"
     FROM owner_profiles WHERE owner_id = $1 LIMIT 1`,
    [ownerId]
  );
  return rows[0] ?? null;
}

async function getDiscoverProfilesFromDb(ownerId) {
  const ownerProfile = ownerId ? await getOwnerProfile(ownerId) : null;
  const values = [];
  const clauses = [];

  if (ownerProfile?.preferredSpecies) {
    values.push(ownerProfile.preferredSpecies);
    clauses.push(`species = $${values.length}`);
  }
  if (typeof ownerProfile?.maxDistanceKm === 'number' && ownerProfile.maxDistanceKm > 0) {
    values.push(ownerProfile.maxDistanceKm);
    clauses.push(`distance_km <= $${values.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await pg.query(
    `SELECT id, display_name, species, age_label, bio, distance_km, photos, prompts
     FROM discover_profiles ${where}
     ORDER BY created_at DESC`,
    values
  );

  return Promise.all(rows.map(async (r) => {
    const photoValues = Array.isArray(r.photos) ? r.photos : [];
    const photos = await Promise.all(photoValues.map(async (entry) => {
      if (typeof entry !== 'string') return '';
      if (entry.startsWith('http://') || entry.startsWith('https://')) return entry;
      try { return await minio.presignedGetObject(MINIO_BUCKET, entry, 60 * 60 * 24); } catch { return entry; }
    }));

    return {
      id: r.id,
      displayName: r.display_name,
      species: r.species,
      ageLabel: r.age_label,
      bio: r.bio,
      distanceKm: Number(r.distance_km),
      photos,
      prompts: Array.isArray(r.prompts) ? r.prompts : [],
    };
  }));
}

app.get('/health', async (_req, res) => {
  try {
    await pg.query('SELECT 1');
    await redis.ping();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.post('/auth/mock-login', async (req, res) => {
  const email = String(req.body?.email || 'demo@sharethepaws.local').toLowerCase().trim();
  const safe = email.replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const ownerId = `owner-${safe || crypto.randomUUID()}`;
  const token = `local-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
  await redis.set(`session:${token}`, ownerId, { EX: 60 * 60 * 24 * 7 });
  res.json({ token, ownerId });
});

app.get('/me/profile', requireAuth, async (req, res) => {
  res.json({ profile: await getOwnerProfile(req.ownerId) });
});

app.post('/me/profile', requireAuth, async (req, res) => {
  const { displayName, species, breed = null, ageLabel = null, city = null, bio = null, preferredSpecies = null, maxDistanceKm = null } = req.body || {};
  if (!String(displayName || '').trim() || !String(species || '').trim()) {
    return res.status(400).json({ error: 'display_name_and_species_required' });
  }

  await pg.query(
    `INSERT INTO owner_profiles (owner_id, display_name, species, breed, age_label, city, bio, preferred_species, max_distance_km, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
     ON CONFLICT (owner_id) DO UPDATE
     SET display_name = EXCLUDED.display_name, species = EXCLUDED.species, breed = EXCLUDED.breed,
         age_label = EXCLUDED.age_label, city = EXCLUDED.city, bio = EXCLUDED.bio,
         preferred_species = EXCLUDED.preferred_species, max_distance_km = EXCLUDED.max_distance_km, updated_at = NOW()`,
    [req.ownerId, String(displayName).trim(), String(species).trim(), breed, ageLabel, city, bio, preferredSpecies, maxDistanceKm]
  );

  res.json({ profile: await getOwnerProfile(req.ownerId) });
});

app.post('/admin/generate-fake-profiles', requireAuth, async (_req, res) => {
  try { await generateProfilesIntoStorageAndDb(); res.json({ ok: true, generated: seedProfiles.length }); }
  catch (e) { res.status(500).json({ ok: false, error: String(e) }); }
});

app.post('/admin/reset-fake-profiles', requireAuth, async (_req, res) => {
  try { await clearGeneratedData(); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ ok: false, error: String(e) }); }
});

app.get('/discover', requireAuth, async (req, res) => {
  try {
    const profiles = await getDiscoverProfilesFromDb(req.ownerId);
    res.json({ profiles });
  } catch {
    res.json({ profiles: seedProfiles });
  }
});

app.post('/swipe', requireAuth, async (req, res) => {
  const { profileId, direction } = req.body || {};
  const profiles = await getDiscoverProfilesFromDb(req.ownerId).catch(() => seedProfiles);
  const profile = profiles.find((p) => p.id === profileId);
  if (!profile) return res.status(404).json({ error: 'profile_not_found' });

  if (direction === 'left') {
    await pg.query(
      `INSERT INTO chats (owner_id, profile_id, display_name, prompt_preview)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (owner_id, profile_id) DO NOTHING`,
      [req.ownerId, profile.id, profile.displayName, profile.prompts[0]?.answer ?? 'Say hi 👋']
    );
    return res.json({ matched: true });
  }
  res.json({ matched: false });
});

app.get('/chats', requireAuth, async (req, res) => {
  const { rows } = await pg.query(
    `SELECT c.profile_id as "profileId", c.display_name as "displayName", c.prompt_preview as "promptPreview",
            lm.text as "lastMessage", lm.created_at as "lastMessageAt",
            COALESCE(unread.count, 0)::int as "unreadCount"
     FROM chats c
     LEFT JOIN LATERAL (
       SELECT text, created_at FROM chat_messages m
       WHERE m.owner_id = c.owner_id AND m.profile_id = c.profile_id
       ORDER BY created_at DESC LIMIT 1
     ) lm ON TRUE
     LEFT JOIN LATERAL (
       SELECT COUNT(*) as count FROM chat_messages m
       WHERE m.owner_id = c.owner_id AND m.profile_id = c.profile_id AND m.sender = 'pet' AND m.read_at IS NULL
     ) unread ON TRUE
     WHERE c.owner_id = $1
     ORDER BY COALESCE(lm.created_at, c.created_at) DESC`,
    [req.ownerId]
  );
  res.json({ chats: rows });
});

app.get('/chat/messages', requireAuth, async (req, res) => {
  const profileId = String(req.query.profileId || '');
  if (!profileId) return res.status(400).json({ error: 'profile_id_required' });
  const { rows } = await pg.query(
    `SELECT id::text, sender, text, created_at as "createdAt"
     FROM chat_messages WHERE owner_id = $1 AND profile_id = $2 ORDER BY created_at ASC`,
    [req.ownerId, profileId]
  );
  res.json({ messages: rows });
});

app.post('/chat/read', requireAuth, async (req, res) => {
  const profileId = String(req.body?.profileId || '');
  if (!profileId) return res.status(400).json({ error: 'profile_id_required' });
  await pg.query(
    `UPDATE chat_messages SET read_at = NOW()
     WHERE owner_id = $1 AND profile_id = $2 AND sender = 'pet' AND read_at IS NULL`,
    [req.ownerId, profileId]
  );
  res.json({ ok: true });
});

app.post('/chat/messages', requireAuth, async (req, res) => {
  const { profileId, text } = req.body || {};
  const msgText = String(text || '').trim();
  if (!profileId || !msgText) return res.status(400).json({ error: 'profile_id_and_text_required' });

  const chatRow = await pg.query('SELECT display_name as "displayName" FROM chats WHERE owner_id = $1 AND profile_id = $2 LIMIT 1', [req.ownerId, profileId]);
  if (!chatRow.rowCount) return res.status(404).json({ error: 'chat_not_found' });

  await pg.query(
    `INSERT INTO chat_messages (owner_id, profile_id, sender, text, read_at) VALUES ($1,$2,'owner',$3,NOW())`,
    [req.ownerId, profileId, msgText]
  );

  const replyText = `🐾 ${chatRow.rows[0].displayName}: ${msgText.slice(0, 120)}`;
  await pg.query(
    `INSERT INTO chat_messages (owner_id, profile_id, sender, text) VALUES ($1,$2,'pet',$3)`,
    [req.ownerId, profileId, replyText]
  );

  const { rows } = await pg.query(
    `SELECT id::text, sender, text, created_at as "createdAt"
     FROM chat_messages WHERE owner_id = $1 AND profile_id = $2 ORDER BY created_at ASC`,
    [req.ownerId, profileId]
  );
  res.json({ messages: rows });
});

init()
  .then(() => app.listen(PORT, () => console.log(`sharethepaws-server listening on :${PORT}`)))
  .catch((e) => { console.error('Failed to start server', e); process.exit(1); });
