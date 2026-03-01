import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

export function MessagesScreen() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Private Messages</Text>
      <View style={styles.thread}>
        <Text style={styles.name}>Luna the Cat</Text>
        <Text style={styles.msg}>pspsps... want to trade snack tips?</Text>
      </View>
      <Text style={styles.note}>All chats should be in pet persona.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: theme.spacing.sm },
  title: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  thread: { backgroundColor: theme.colors.panel, borderRadius: theme.radius.md, padding: 12, gap: 6 },
  name: { fontWeight: '700', color: theme.colors.text },
  msg: { color: theme.colors.textSubtle },
  note: { color: theme.colors.textSubtle, fontSize: 12 },
});
