import { Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { useEffect, useState } from 'react';
import { theme } from '../theme';
import { OwnerProfile } from '../api/client';

type Props = {
  profile: OwnerProfile | null;
  onSave: (profile: OwnerProfile) => Promise<void>;
};

export function ProfileScreen({ profile, onSave }: Props) {
  const [form, setForm] = useState<OwnerProfile>({
    displayName: '',
    species: '',
    breed: '',
    ageLabel: '',
    city: '',
    bio: '',
    preferredSpecies: '',
    maxDistanceKm: 10,
  });

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>Pet Profile</Text>
      <TextInput placeholder="Pet name" value={form.displayName} onChangeText={(v) => setForm({ ...form, displayName: v })} style={styles.input} />
      <TextInput placeholder="Species" value={form.species} onChangeText={(v) => setForm({ ...form, species: v })} style={styles.input} />
      <TextInput placeholder="Breed" value={form.breed ?? ''} onChangeText={(v) => setForm({ ...form, breed: v })} style={styles.input} />
      <TextInput placeholder="Age" value={form.ageLabel ?? ''} onChangeText={(v) => setForm({ ...form, ageLabel: v })} style={styles.input} />
      <TextInput placeholder="City" value={form.city ?? ''} onChangeText={(v) => setForm({ ...form, city: v })} style={styles.input} />
      <TextInput placeholder="Bio" value={form.bio ?? ''} onChangeText={(v) => setForm({ ...form, bio: v })} style={styles.input} />
      <TextInput placeholder="Preferred species" value={form.preferredSpecies ?? ''} onChangeText={(v) => setForm({ ...form, preferredSpecies: v })} style={styles.input} />
      <TextInput
        placeholder="Max distance (km)"
        keyboardType="number-pad"
        value={String(form.maxDistanceKm ?? '')}
        onChangeText={(v) => setForm({ ...form, maxDistanceKm: Number(v) || 0 })}
        style={styles.input}
      />
      <Pressable style={styles.button} onPress={() => onSave(form)}>
        <Text style={styles.buttonText}>Save Profile</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 24, gap: theme.spacing.sm },
  title: { fontSize: 24, fontWeight: '800', color: theme.colors.text },
  input: { backgroundColor: theme.colors.white, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, padding: 12 },
  button: { backgroundColor: theme.colors.accent, borderRadius: theme.radius.md, padding: 12, alignItems: 'center', marginTop: 6 },
  buttonText: { color: theme.colors.white, fontWeight: '700' },
});
