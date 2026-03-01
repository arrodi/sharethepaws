import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../theme';

export function OnboardingScreen() {
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>Create Pet Dating Profile</Text>
      <Text style={styles.subtitle}>Set up your pet so compatible nearby pets can find you.</Text>

      <TextInput placeholder="Pet name" style={styles.input} />
      <TextInput placeholder="Species (dog, cat...)" style={styles.input} />
      <TextInput placeholder="Breed" style={styles.input} />
      <TextInput placeholder="Age" style={styles.input} />
      <TextInput placeholder="City" style={styles.input} />

      <Text style={styles.section}>Preferences</Text>
      <TextInput placeholder="Preferred species" style={styles.input} />
      <TextInput placeholder="Max distance (km)" style={styles.input} keyboardType="number-pad" />

      <Pressable style={styles.button}><Text style={styles.buttonText}>Save Profile</Text></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 24, gap: theme.spacing.sm },
  title: { fontSize: 24, fontWeight: '800', color: theme.colors.text },
  subtitle: { color: theme.colors.textSubtle, marginBottom: 4 },
  section: { color: theme.colors.text, fontWeight: '700', marginTop: 6 },
  input: { backgroundColor: theme.colors.white, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, padding: 12 },
  button: { backgroundColor: theme.colors.accent, borderRadius: theme.radius.md, padding: 12, alignItems: 'center', marginTop: 6 },
  buttonText: { color: theme.colors.white, fontWeight: '700' },
});
