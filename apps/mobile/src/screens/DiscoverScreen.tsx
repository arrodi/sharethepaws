import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { fakeProfiles } from '../mock/profiles';
import { theme } from '../theme';

export function DiscoverScreen() {
  const [index, setIndex] = useState(0);

  const profile = useMemo(() => fakeProfiles[index % fakeProfiles.length], [index]);
  const topPrompt = profile.prompts[0];

  const next = () => setIndex((v) => v + 1);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Discover</Text>
      <View style={styles.card}>
        <Image source={{ uri: profile.photos[0] }} style={styles.photo} />
        <Text style={styles.name}>
          {profile.displayName} • {profile.species} • {profile.ageLabel}
        </Text>
        <Text style={styles.meta}>{profile.distanceKm.toFixed(1)} km away</Text>
        <Text style={styles.bio}>{profile.bio}</Text>

        <View style={styles.promptWrap}>
          <Text style={styles.promptQ}>{topPrompt.question}</Text>
          <Text style={styles.promptA}>{topPrompt.answer}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={[styles.actionBtn, styles.passBtn]} onPress={next}>
          <Text style={styles.passText}>Pass</Text>
        </Pressable>
        <Pressable style={[styles.actionBtn, styles.likeBtn]} onPress={next}>
          <Text style={styles.likeText}>Like</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: theme.spacing.md },
  title: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  card: { backgroundColor: theme.colors.panel, borderRadius: theme.radius.lg, padding: 14, gap: 8, borderWidth: 1, borderColor: theme.colors.border },
  photo: { width: '100%', height: 220, borderRadius: 12, backgroundColor: '#dcefe1' },
  name: { color: theme.colors.text, fontWeight: '800', fontSize: 18 },
  bio: { color: theme.colors.textSubtle },
  meta: { color: theme.colors.textSubtle, fontSize: 12 },
  promptWrap: { backgroundColor: '#f0faf2', borderRadius: 10, padding: 10, gap: 4 },
  promptQ: { color: theme.colors.text, fontWeight: '700' },
  promptA: { color: theme.colors.textSubtle },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, borderRadius: theme.radius.md, paddingVertical: 12, alignItems: 'center' },
  passBtn: { backgroundColor: '#e7efe9' },
  likeBtn: { backgroundColor: theme.colors.accent },
  passText: { color: theme.colors.textSubtle, fontWeight: '700' },
  likeText: { color: theme.colors.white, fontWeight: '700' },
});
