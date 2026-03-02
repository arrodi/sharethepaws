const base = process.env.API_BASE_URL || 'http://localhost:4000';

async function j(path, init = {}) {
  const r = await fetch(`${base}${path}`, init);
  const text = await r.text();
  let data = null;
  try { data = JSON.parse(text); } catch {}
  if (!r.ok) throw new Error(`${path} ${r.status}: ${text}`);
  return data;
}

const login = await j('/auth/mock-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'smoke@sharethepaws.local' }),
});

const auth = { Authorization: `Bearer ${login.token}`, 'Content-Type': 'application/json' };

await j('/health');
await j('/admin/generate-fake-profiles', { method: 'POST', headers: auth });
await j('/me/profile', {
  method: 'POST',
  headers: auth,
  body: JSON.stringify({ displayName: 'Smoke', species: 'dog', preferredSpecies: 'cat', maxDistanceKm: 10 }),
});

const discover = await j('/discover', { headers: auth });
if (!Array.isArray(discover.profiles)) throw new Error('discover profiles missing');

if (discover.profiles.length > 0) {
  const p = discover.profiles[0];
  await j('/swipe', { method: 'POST', headers: auth, body: JSON.stringify({ profileId: p.id, direction: 'left' }) });
  await j('/chat/messages', { method: 'POST', headers: auth, body: JSON.stringify({ profileId: p.id, text: 'hello' }) });
  await j(`/chat/messages?profileId=${encodeURIComponent(p.id)}`, { headers: auth });
}

await j('/chats', { headers: auth });
console.log('smoke ok');
