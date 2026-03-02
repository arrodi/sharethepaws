import { PetDatingProfile } from '../mock/profiles';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000';

let authToken: string | null = null;
export function setAuthToken(token: string | null) {
  authToken = token;
}

async function apiFetch(path: string, init: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  return fetch(`${API_BASE_URL}${path}`, { ...init, headers });
}

export type ChatEntry = {
  profileId: string;
  displayName: string;
  promptPreview: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
};

export async function mockLogin(email?: string) {
  const r = await fetch(`${API_BASE_URL}/auth/mock-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!r.ok) throw new Error('login_failed');
  return r.json() as Promise<{ token: string; ownerId: string }>;
}

export async function fetchDiscoverProfiles(): Promise<PetDatingProfile[]> {
  const r = await apiFetch('/discover', { method: 'GET' });
  if (!r.ok) throw new Error('discover_failed');
  const data = await r.json();
  return data.profiles as PetDatingProfile[];
}

export async function swipe(profileId: string, direction: 'left' | 'right') {
  const r = await apiFetch('/swipe', {
    method: 'POST',
    body: JSON.stringify({ profileId, direction }),
  });
  if (!r.ok) throw new Error('swipe_failed');
  return r.json() as Promise<{ matched: boolean }>;
}

export async function fetchChats(): Promise<ChatEntry[]> {
  const r = await apiFetch('/chats', { method: 'GET' });
  if (!r.ok) throw new Error('chats_failed');
  const data = await r.json();
  return data.chats as ChatEntry[];
}

export async function generateFakeProfiles() {
  const r = await apiFetch('/admin/generate-fake-profiles', { method: 'POST' });
  if (!r.ok) {
    const text = await r.text().catch(() => 'generate_failed');
    throw new Error(text || 'generate_failed');
  }
  return r.json() as Promise<{ ok: boolean; generated: number }>;
}

export async function resetFakeProfiles() {
  const r = await apiFetch('/admin/reset-fake-profiles', { method: 'POST' });
  if (!r.ok) throw new Error('reset_failed');
  return r.json() as Promise<{ ok: boolean }>;
}

export type OwnerProfile = {
  displayName: string;
  species: string;
  breed?: string;
  ageLabel?: string;
  city?: string;
  bio?: string;
  preferredSpecies?: string;
  maxDistanceKm?: number;
};

export async function fetchOwnerProfile(): Promise<OwnerProfile | null> {
  const r = await apiFetch('/me/profile', { method: 'GET' });
  if (!r.ok) throw new Error('profile_fetch_failed');
  const data = await r.json();
  return (data.profile ?? null) as OwnerProfile | null;
}

export async function saveOwnerProfile(profile: OwnerProfile): Promise<OwnerProfile> {
  const r = await apiFetch('/me/profile', {
    method: 'POST',
    body: JSON.stringify(profile),
  });
  if (!r.ok) {
    const text = await r.text().catch(() => 'profile_save_failed');
    throw new Error(text || 'profile_save_failed');
  }
  const data = await r.json();
  return data.profile as OwnerProfile;
}

export type ChatMessage = {
  id: string;
  sender: 'owner' | 'pet';
  text: string;
  createdAt: string;
};

export async function fetchChatMessages(profileId: string): Promise<ChatMessage[]> {
  const r = await apiFetch(`/chat/messages?profileId=${encodeURIComponent(profileId)}`, { method: 'GET' });
  if (!r.ok) throw new Error('messages_failed');
  const data = await r.json();
  return data.messages as ChatMessage[];
}

export async function markChatRead(profileId: string) {
  await apiFetch('/chat/read', {
    method: 'POST',
    body: JSON.stringify({ profileId }),
  });
}

export async function sendChatMessage(profileId: string, text: string): Promise<ChatMessage[]> {
  const r = await apiFetch('/chat/messages', {
    method: 'POST',
    body: JSON.stringify({ profileId, text }),
  });
  if (!r.ok) {
    const body = await r.text().catch(() => 'send_failed');
    throw new Error(body || 'send_failed');
  }
  const data = await r.json();
  return data.messages as ChatMessage[];
}

export { API_BASE_URL };
