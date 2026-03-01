import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { fakeProfiles } from '../mock/profiles';
import { theme } from '../theme';

const fakeMatches = [fakeProfiles[1], fakeProfiles[2], fakeProfiles[7]];

export function MatchesScreen() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Matches</Text>
      {fakeMatches.map((m) => (
        <Pressable key={m.id} style={styles.row}>
          <Image source={{ uri: m.photos[0] }} style={styles.avatar} />
          <View style={styles.center}>
            <Text style={styles.name}>{m.displayName}</Text>
            <Text style={styles.meta}>{m.prompts[0].answer}</Text>
          </View>
          <Text style={styles.cta}>Chat</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: theme.spacing.sm },
  title: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  row: { backgroundColor: theme.colors.panel, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#2a1a46' },
  center: { flex: 1, gap: 2 },
  name: { color: theme.colors.text, fontWeight: '700' },
  meta: { color: theme.colors.textSubtle, fontSize: 12 },
  cta: { color: theme.colors.accentDark, fontWeight: '800' },
});
