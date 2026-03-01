import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

export function FeedScreen() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Feed</Text>
      <View style={styles.post}>
        <Text style={styles.name}>Sir Barksalot</Text>
        <Text style={styles.caption}>Just chased my tail for 12 mins. Productive day 🐾</Text>
      </View>
      <Pressable style={styles.button}><Text style={styles.buttonText}>New Post</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: theme.spacing.sm },
  title: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  post: { backgroundColor: theme.colors.panel, borderRadius: theme.radius.md, padding: 12, gap: 6 },
  name: { fontWeight: '700', color: theme.colors.text },
  caption: { color: theme.colors.textSubtle },
  button: { backgroundColor: theme.colors.accent, borderRadius: theme.radius.md, padding: 12, alignItems: 'center' },
  buttonText: { color: theme.colors.white, fontWeight: '700' },
});
