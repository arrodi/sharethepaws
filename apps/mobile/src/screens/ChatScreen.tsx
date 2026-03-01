import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PetDatingProfile } from '../mock/profiles';
import { theme } from '../theme';

type Props = {
  chats: PetDatingProfile[];
};

export function ChatScreen({ chats }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Chats</Text>
      {chats.length === 0 ? <Text style={styles.empty}>No chats yet. Match from Discover to start one.</Text> : null}
      <ScrollView contentContainerStyle={styles.list}>
        {chats.map((c) => (
          <Pressable key={c.id} style={styles.row}>
            <View style={styles.avatarStub}><Text style={styles.avatarText}>{c.displayName.slice(0, 1)}</Text></View>
            <View style={styles.center}>
              <Text style={styles.name}>{c.displayName}</Text>
              <Text style={styles.preview}>{c.prompts[0]?.answer ?? 'Say hi 👋'}</Text>
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
});
