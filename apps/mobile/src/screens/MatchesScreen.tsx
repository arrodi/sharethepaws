import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChatEntry } from '../api/client';
import { theme } from '../theme';

type Props = {
  chats: ChatEntry[];
};

export function MatchesScreen({ chats }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Matches</Text>
      {chats.length === 0 ? (
        <Text style={styles.empty}>No matches yet. Swipe left on Discover to create one.</Text>
      ) : (
        chats.map((m) => (
          <Pressable key={m.profileId} style={styles.row}>
            <Image source={{ uri: `https://api.dicebear.com/9.x/thumbs/png?seed=${encodeURIComponent(m.profileId)}` }} style={styles.avatar} />
            <View style={styles.center}>
              <Text style={styles.name}>{m.displayName}</Text>
              <Text style={styles.meta}>{m.promptPreview}</Text>
            </View>
            <Text style={styles.cta}>Chat</Text>
          </Pressable>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: theme.spacing.sm },
  title: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  empty: { color: theme.colors.textSubtle },
  row: { backgroundColor: theme.colors.panel, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#2a1a46' },
  center: { flex: 1, gap: 2 },
  name: { color: theme.colors.text, fontWeight: '700' },
  meta: { color: theme.colors.textSubtle, fontSize: 12 },
  cta: { color: theme.colors.accentDark, fontWeight: '800' },
});
