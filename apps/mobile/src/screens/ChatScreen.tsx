import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ChatEntry, ChatMessage, fetchChatMessages, markChatRead, sendChatMessage } from '../api/client';
import { theme } from '../theme';

type Props = {
  chats: ChatEntry[];
  onRefreshChats: () => Promise<void>;
};

export function ChatScreen({ chats, onRefreshChats }: Props) {
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const activeChat = useMemo(() => chats.find((c) => c.profileId === activeProfileId), [chats, activeProfileId]);

  const openChat = async (profileId: string) => {
    setActiveProfileId(profileId);
    setErrorText(null);
    const list = await fetchChatMessages(profileId).catch(() => []);
    setMessages(list);
    await markChatRead(profileId).catch(() => null);
    await onRefreshChats();
  };

  useEffect(() => {
    if (!activeProfileId) return;
    const interval = setInterval(async () => {
      const list = await fetchChatMessages(activeProfileId).catch(() => null);
      if (list) setMessages(list);
    }, 3500);
    return () => clearInterval(interval);
  }, [activeProfileId]);

  const send = async () => {
    if (!activeProfileId || !text.trim() || sending) return;
    const optimistic: ChatMessage = {
      id: `tmp-${Date.now()}`,
      sender: 'owner',
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setSending(true);
    setErrorText(null);
    setMessages((prev) => [...prev, optimistic]);
    const outgoing = text.trim();
    setText('');

    try {
      const list = await sendChatMessage(activeProfileId, outgoing);
      setMessages(list);
      await onRefreshChats();
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      const message = error instanceof Error ? error.message : 'Failed to send message';
      setErrorText(message);
    } finally {
      setSending(false);
    }
  };

  if (activeProfileId) {
    return (
      <View style={styles.wrap}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => setActiveProfileId(null)}>
            <Text style={styles.back}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>{activeChat?.displayName ?? 'Chat'}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.msgList}>
          {messages.map((m) => (
            <View key={m.id} style={[styles.bubble, m.sender === 'owner' ? styles.bubbleOwner : styles.bubblePet]}>
              <Text style={[styles.bubbleText, m.sender === 'pet' && styles.bubbleTextPet]}>{m.text}</Text>
              <Text style={[styles.timestamp, m.sender === 'owner' ? styles.timestampOwner : styles.timestampPet]}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          ))}
        </ScrollView>

        {errorText ? <Text style={styles.error}>{errorText}</Text> : null}

        <View style={styles.inputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message"
            placeholderTextColor={theme.colors.textSubtle}
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={send}
            editable={!sending}
          />
          <Pressable style={[styles.sendBtn, sending && styles.sendBtnDisabled]} onPress={send}>
            <Text style={styles.sendText}>{sending ? '...' : 'Send'}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Matches</Text>
      {chats.length === 0 ? <Text style={styles.empty}>No matches yet. Swipe left on Discover to start one.</Text> : null}
      <ScrollView contentContainerStyle={styles.list}>
        {chats.map((c) => (
          <Pressable key={c.profileId} style={styles.row} onPress={() => openChat(c.profileId)}>
            <View style={styles.avatarStub}><Text style={styles.avatarText}>{c.displayName.slice(0, 1)}</Text></View>
            <View style={styles.center}>
              <Text style={styles.name}>{c.displayName}</Text>
              <Text style={styles.preview}>{c.lastMessage ?? c.promptPreview ?? 'Say hi 👋'}</Text>
            </View>
            <View style={styles.rightCol}>
              {c.unreadCount ? <Text style={styles.unread}>{c.unreadCount}</Text> : null}
              <Text style={styles.cta}>Open</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: theme.spacing.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  back: { color: theme.colors.accent, fontWeight: '700' },
  title: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  empty: { color: theme.colors.textSubtle },
  list: { gap: 8, paddingBottom: 18 },
  row: { backgroundColor: theme.colors.panel, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarStub: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#2a1a46', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800', color: theme.colors.text },
  center: { flex: 1, gap: 2 },
  rightCol: { alignItems: 'flex-end', gap: 4 },
  unread: { minWidth: 20, textAlign: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, backgroundColor: theme.colors.accent, color: '#fff', fontWeight: '700' },
  name: { color: theme.colors.text, fontWeight: '700' },
  preview: { color: theme.colors.textSubtle, fontSize: 12 },
  cta: { color: theme.colors.accentDark, fontWeight: '800' },
  msgList: { gap: 8, paddingVertical: 8 },
  bubble: { maxWidth: '82%', padding: 10, borderRadius: 12 },
  bubbleOwner: { alignSelf: 'flex-end', backgroundColor: theme.colors.accent },
  bubblePet: { alignSelf: 'flex-start', backgroundColor: theme.colors.panel, borderWidth: 1, borderColor: theme.colors.border },
  bubbleText: { color: '#fff' },
  bubbleTextPet: { color: theme.colors.text },
  timestamp: { marginTop: 4, fontSize: 10 },
  timestampOwner: { color: 'rgba(255,255,255,0.75)' },
  timestampPet: { color: theme.colors.textSubtle },
  error: { color: '#ff8b8b' },
  inputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.panel, color: theme.colors.text, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  sendBtn: { backgroundColor: theme.colors.accent, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  sendBtnDisabled: { opacity: 0.6 },
  sendText: { color: '#fff', fontWeight: '800' },
});
