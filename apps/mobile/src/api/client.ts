import { PetDatingProfile } from '../mock/profiles';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000';

type ChatEntry = {
  profileId: string;
  displayName: string;
  promptPreview: string;
};

export async function mockLogin() {
  const r = await fetch(`${API_BASE_URL}/auth/mock-login`, { method: 'POST' });
  if (!r.ok) throw new Error('login_failed');
  return r.json() as Promise<{ token: string; ownerId: string }>;
}

export async function fetchDiscoverProfiles(): Promise<PetDatingProfile[]> {
  const r = await fetch(`${API_BASE_URL}/discover`);
  if (!r.ok) throw new Error('discover_failed');
  const data = await r.json();
  return data.profiles as PetDatingProfile[];
}

export async function swipe(ownerId: string, profileId: string, direction: 'left' | 'right') {
  const r = await fetch(`${API_BASE_URL}/swipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ownerId, profileId, direction }),
  });
  if (!r.ok) throw new Error('swipe_failed');
  return r.json() as Promise<{ matched: boolean }>;
}

export async function fetchChats(ownerId: string): Promise<ChatEntry[]> {
  const r = await fetch(`${API_BASE_URL}/chats?ownerId=${encodeURIComponent(ownerId)}`);
  if (!r.ok) throw new Error('chats_failed');
  const data = await r.json();
  return data.chats as ChatEntry[];
}

export type { ChatEntry };
export { API_BASE_URL };
