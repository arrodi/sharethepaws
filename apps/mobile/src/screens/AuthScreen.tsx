import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../theme';

type Props = {
  onContinue: (email: string) => void;
};

export function AuthScreen({ onContinue }: Props) {
  const [email, setEmail] = useState('demo@sharethepaws.local');

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Welcome to Share the Paws</Text>
      <Text style={styles.subtitle}>Sign in as a human to match and chat for your pet.</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address" />
      <TextInput placeholder="Password" style={styles.input} secureTextEntry />
      <Pressable style={styles.button} onPress={() => onContinue(email)}><Text style={styles.buttonText}>Continue</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: theme.spacing.sm },
  title: { fontSize: 24, fontWeight: '800', color: theme.colors.text },
  subtitle: { color: theme.colors.textSubtle, marginBottom: 8 },
  input: { backgroundColor: theme.colors.white, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, padding: 12 },
  button: { backgroundColor: theme.colors.accent, borderRadius: theme.radius.md, padding: 12, alignItems: 'center' },
  buttonText: { color: theme.colors.white, fontWeight: '700' },
});
