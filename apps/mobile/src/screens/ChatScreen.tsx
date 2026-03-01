import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../theme';

export function ChatScreen() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Chat</Text>
      <View style={styles.msgIn}><Text style={styles.msgText}>woof! want a park meetup this weekend?</Text></View>
      <View style={styles.msgOut}><Text style={[styles.msgText, styles.msgOutText]}>meow yes! saturday morning works 🐾</Text></View>

      <View style={styles.composer}>
        <TextInput placeholder="Write as your pet..." style={styles.input} />
        <Pressable style={styles.send}><Text style={styles.sendText}>Send</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: theme.spacing.sm },
  title: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  msgIn: { alignSelf: 'flex-start', backgroundColor: theme.colors.panel, borderRadius: theme.radius.md, padding: 10, maxWidth: '82%' },
  msgOut: { alignSelf: 'flex-end', backgroundColor: theme.colors.accent, borderRadius: theme.radius.md, padding: 10, maxWidth: '82%' },
  msgText: { color: theme.colors.text },
  msgOutText: { color: theme.colors.white },
  composer: { marginTop: 'auto', flexDirection: 'row', gap: 8 },
  input: { flex: 1, backgroundColor: theme.colors.white, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, paddingHorizontal: 12, paddingVertical: 10 },
  send: { backgroundColor: theme.colors.accentDark, borderRadius: theme.radius.md, paddingHorizontal: 14, justifyContent: 'center' },
  sendText: { color: theme.colors.white, fontWeight: '700' },
});
