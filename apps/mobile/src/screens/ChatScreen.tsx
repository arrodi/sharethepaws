import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ChatEntry, ChatMessage, fetchChatMessages, sendChatMessage } from '../api/client';
import { theme } from '../theme';

type Props = {
  chats: ChatEntry[];
  ownerId: string;
};

export function ChatScreen({ chats, ownerId }: Props) {
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');

  const openChat = async (profileId: string) => {
    setActiveProfileId(profileId);
    const list = await fetchChatMessages(ownerId, profileId).catch(() => []);
    setMessages(list);
  };

  const send = async () => {
    if (!activeProfileId || !text.trim()) return;
    const list = await sendChatMessage(ownerId, activeProfileId, text.trim()).catch(() => null);
    if (list) {
      setMessages(list);
      setText('');
    }
  };

  if (activeProfileId) {
    const chat = chats.find((c) => c.profileId === activeProfileId);
    return (
      <View style={styles.wrap}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => setActiveProfileId(null)}>
            <Text style={styles.back}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>{chat?.displayName ?? 'Chat'}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.msgList}>
          {messages.map((m) => (
            <View key={m.id} style={[styles.bubble, m.sender === 'owner' ? styles.bubbleOwner : styles.bubblePet]}>
              <Text style={styles.bubbleText}>{m.text}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message"
            placeholderTextColor={theme.colors.textSubtle}
            style={styles.input}
          />
          <Pressable style={styles.sendBtn} onPress={send}>
            <Text style={styles.sendText}>Send</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Chats</Text>
      {chats.length === 0 ? <Text style={styles.empty}>No chats yet. Match from Discover to start one.</Text> : null}
      <ScrollView contentContainerStyle={styles.list}>
        {chats.map((c) => (
          <Pressable key={c.profileId} style={styles.row} onPress={() => openChat(c.profileId)}>
            <View style={styles.avatarStub}><Text style={styles.avatarText}>{c.displayName.slice(0, 1)}</Text></View>
            <View style={styles.center}>
              <Text style={styles.name}>{c.displayName}</Text>
              <Text style={styles.preview}>{c.promptPreview ?? 'Say hi 👋'}</Text>
            </View>
            <Text style={styles.cta}>Open</Text>
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
  name: { color: theme.colors.text, fontWeight: '700' },
  preview: { color: theme.colors.textSubtle, fontSize: 12 },
  cta: { color: theme.colors.accentDark, fontWeight: '800' },
  msgList: { gap: 8, paddingVertical: 8 },
  bubble: { maxWidth: '82%', padding: 10, borderRadius: 12 },
  bubbleOwner: { alignSelf: 'flex-end', backgroundColor: theme.colors.accent },
  bubblePet: { alignSelf: 'flex-start', backgroundColor: theme.colors.panel, borderWidth: 1, borderColor: theme.colors.border },
  bubbleText: { color: '#fff' },
  inputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.panel, color: theme.colors.text, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  sendBtn: { backgroundColor: theme.colors.accent, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  sendText: { color: '#fff', fontWeight: '800' },
});
