import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

type Props = {
  onGenerateFakeProfiles: () => Promise<void>;
  onResetFakeProfiles: () => Promise<void>;
};

export function SettingsScreen({ onGenerateFakeProfiles, onResetFakeProfiles }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Local development tools</Text>
      <Pressable style={styles.btn} onPress={onGenerateFakeProfiles}>
        <Text style={styles.btnText}>Generate 10 fake profiles</Text>
      </Pressable>
      <Pressable style={[styles.btn, styles.btnSecondary]} onPress={onResetFakeProfiles}>
        <Text style={styles.btnText}>Reset generated profiles</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: theme.spacing.sm },
  title: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  subtitle: { color: theme.colors.textSubtle },
  btn: { backgroundColor: theme.colors.accent, borderRadius: theme.radius.md, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  btnSecondary: { backgroundColor: '#5b3d96' },
  btnText: { color: '#fff', fontWeight: '800' },
});
