import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

export function MatchesScreen() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Matches</Text>
      <Pressable style={styles.row}>
        <View>
          <Text style={styles.name}>Milo the Golden</Text>
          <Text style={styles.meta}>Matched 2h ago • 1.8 km away</Text>
        </View>
        <Text style={styles.cta}>Chat</Text>
      </Pressable>
      <Pressable style={styles.row}>
        <View>
          <Text style={styles.name}>Poppy the Beagle</Text>
          <Text style={styles.meta}>Matched yesterday • 3.2 km away</Text>
        </View>
        <Text style={styles.cta}>Chat</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: theme.spacing.sm },
  title: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  row: { backgroundColor: theme.colors.panel, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: theme.colors.text, fontWeight: '700' },
  meta: { color: theme.colors.textSubtle, fontSize: 12 },
  cta: { color: theme.colors.accentDark, fontWeight: '800' },
});
