import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

export function ProfileScreen() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Pet Profile</Text>
      <Text style={styles.card}>Name, species, age, bio, avatar</Text>
      <Text style={styles.card}>Owner can manage multiple pet personas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: theme.spacing.sm },
  title: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  card: { backgroundColor: theme.colors.panel, borderRadius: theme.radius.md, padding: 12, color: theme.colors.textSubtle },
});
