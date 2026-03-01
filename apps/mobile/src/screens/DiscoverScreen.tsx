import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

export function DiscoverScreen() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Discover</Text>
      <View style={styles.card}>
        <Text style={styles.name}>Luna • Cat • 2y</Text>
        <Text style={styles.bio}>"I love sunny windows and calm playdates."</Text>
        <Text style={styles.meta}>2.1 km away • Friendly with dogs</Text>
      </View>
      <View style={styles.actions}>
        <Pressable style={[styles.actionBtn, styles.passBtn]}><Text style={styles.passText}>Pass</Text></Pressable>
        <Pressable style={[styles.actionBtn, styles.likeBtn]}><Text style={styles.likeText}>Like</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: theme.spacing.md },
  title: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  card: { backgroundColor: theme.colors.panel, borderRadius: theme.radius.lg, padding: 14, gap: 6, borderWidth: 1, borderColor: theme.colors.border },
  name: { color: theme.colors.text, fontWeight: '800', fontSize: 18 },
  bio: { color: theme.colors.textSubtle },
  meta: { color: theme.colors.textSubtle, fontSize: 12 },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, borderRadius: theme.radius.md, paddingVertical: 12, alignItems: 'center' },
  passBtn: { backgroundColor: '#e7efe9' },
  likeBtn: { backgroundColor: theme.colors.accent },
  passText: { color: theme.colors.textSubtle, fontWeight: '700' },
  likeText: { color: theme.colors.white, fontWeight: '700' },
});
