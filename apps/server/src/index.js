import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import { createClient as createRedisClient } from 'redis';
import { Client as MinioClient } from 'minio';
import { seedProfiles } from './profiles.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.API_PORT || 4000);
const OWNER_ID = 'owner-demo';

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
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
      stream.on('data', (obj) => {
        if (obj?.name) objects.push(obj.name);
      });
      stream.on('error', reject);
      stream.on('end', resolve);
    });

    if (objects.length > 0) {
      await minio.removeObjects(MINIO_BUCKET, objects);
    }
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

async function getDiscoverProfilesFromDb() {
  const { rows } = await pg.query(
    `SELECT id, display_name, species, age_label, bio, distance_km, photos, prompts
     FROM discover_profiles
     ORDER BY created_at DESC`
  );

  const profiles = await Promise.all(
    rows.map(async (r) => {
      const photoValues = Array.isArray(r.photos) ? r.photos : [];
      const photos = await Promise.all(
        photoValues.map(async (entry) => {
          if (typeof entry !== 'string') return '';
          if (entry.startsWith('http://') || entry.startsWith('https://')) return entry;
          try {
            return await minio.presignedGetObject(MINIO_BUCKET, entry, 60 * 60 * 24);
          } catch {
            return entry;
          }
        })
      );

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
    })
  );

  return profiles;
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

app.post('/auth/mock-login', async (_req, res) => {
  const token = `local-${Date.now()}`;
  await redis.set(`session:${token}`, OWNER_ID, { EX: 60 * 60 * 24 * 7 });
  res.json({ token, ownerId: OWNER_ID });
});

app.post('/admin/generate-fake-profiles', async (_req, res) => {
  try {
    await generateProfilesIntoStorageAndDb();
    res.json({ ok: true, generated: seedProfiles.length });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.post('/admin/reset-fake-profiles', async (_req, res) => {
  try {
    await clearGeneratedData();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.get('/discover', async (_req, res) => {
  try {
    const profiles = await getDiscoverProfilesFromDb();
    res.json({ profiles });
  } catch {
    res.json({ profiles: seedProfiles });
  }
});

app.post('/swipe', async (req, res) => {
  const { ownerId = OWNER_ID, profileId, direction } = req.body || {};
  const profiles = await getDiscoverProfilesFromDb().catch(() => seedProfiles);
  const profile = profiles.find((p) => p.id === profileId);
  if (!profile) return res.status(404).json({ error: 'profile_not_found' });

  if (direction === 'left') {
    await pg.query(
      `INSERT INTO chats (owner_id, profile_id, display_name, prompt_preview)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (owner_id, profile_id) DO NOTHING`,
      [ownerId, profile.id, profile.displayName, profile.prompts[0]?.answer ?? 'Say hi 👋']
    );
    return res.json({ matched: true });
  }

  res.json({ matched: false });
});

app.get('/chats', async (req, res) => {
  const ownerId = String(req.query.ownerId || OWNER_ID);
  const { rows } = await pg.query(
    'SELECT profile_id as "profileId", display_name as "displayName", prompt_preview as "promptPreview" FROM chats WHERE owner_id = $1 ORDER BY created_at DESC',
    [ownerId]
  );
  res.json({ chats: rows });
});

app.get('/chat/messages', async (req, res) => {
  const ownerId = String(req.query.ownerId || OWNER_ID);
  const profileId = String(req.query.profileId || '');
  if (!profileId) return res.status(400).json({ error: 'profile_id_required' });

  const { rows } = await pg.query(
    `SELECT id::text, sender, text, created_at as "createdAt"
     FROM chat_messages
     WHERE owner_id = $1 AND profile_id = $2
     ORDER BY created_at ASC`,
    [ownerId, profileId]
  );

  res.json({ messages: rows });
});

app.post('/chat/messages', async (req, res) => {
  const { ownerId = OWNER_ID, profileId, text } = req.body || {};
  const msgText = String(text || '').trim();
  if (!profileId || !msgText) return res.status(400).json({ error: 'profile_id_and_text_required' });

  const chatRow = await pg.query('SELECT display_name as "displayName" FROM chats WHERE owner_id = $1 AND profile_id = $2 LIMIT 1', [ownerId, profileId]);
  if (!chatRow.rowCount) return res.status(404).json({ error: 'chat_not_found' });

  const insertUser = await pg.query(
    `INSERT INTO chat_messages (owner_id, profile_id, sender, text)
     VALUES ($1,$2,'owner',$3)
     RETURNING id::text, sender, text, created_at as "createdAt"`,
    [ownerId, profileId, msgText]
  );

  const replyText = `🐾 ${chatRow.rows[0].displayName}: ${msgText.slice(0, 120)}`;
  await pg.query(
    `INSERT INTO chat_messages (owner_id, profile_id, sender, text)
     VALUES ($1,$2,'pet',$3)`,
    [ownerId, profileId, replyText]
  );

  const { rows } = await pg.query(
    `SELECT id::text, sender, text, created_at as "createdAt"
     FROM chat_messages
     WHERE owner_id = $1 AND profile_id = $2
     ORDER BY created_at ASC`,
    [ownerId, profileId]
  );

  res.json({ sent: insertUser.rows[0], messages: rows });
});

init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`sharethepaws-server listening on :${PORT}`);
    });
  })
  .catch((e) => {
    console.error('Failed to start server', e);
    process.exit(1);
  });
