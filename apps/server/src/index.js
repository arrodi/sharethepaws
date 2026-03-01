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

const pg = new Pool({ connectionString: process.env.POSTGRES_URL || 'postgres://postgres:postgres@localhost:5432/sharethepaws' });
const redis = createRedisClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });

const minio = new MinioClient({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: Number(process.env.MINIO_PORT || 9000),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});
const MINIO_BUCKET = process.env.MINIO_BUCKET || 'pet-photos';

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

  try {
    const exists = await minio.bucketExists(MINIO_BUCKET);
    if (!exists) await minio.makeBucket(MINIO_BUCKET);
  } catch {
    // non-fatal for local dev
  }
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

app.get('/discover', async (_req, res) => {
  res.json({ profiles: seedProfiles });
});

app.post('/swipe', async (req, res) => {
  const { ownerId = OWNER_ID, profileId, direction } = req.body || {};
  const profile = seedProfiles.find((p) => p.id === profileId);
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
