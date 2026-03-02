import { useMemo, useState } from 'react';
import { Image, PanResponder, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PetDatingProfile } from '../mock/profiles';
import { theme } from '../theme';

type Props = {
  profiles: PetDatingProfile[];
  onReject: (profile: PetDatingProfile) => boolean;
  onConnect: (profile: PetDatingProfile) => boolean;
};

export function DiscoverScreen({ profiles, onReject, onConnect }: Props) {
  const [index, setIndex] = useState(0);

  const profile = useMemo(
    () => (profiles.length ? profiles[index % profiles.length] : null),
    [index, profiles]
  );

  const goNext = () => setIndex((v) => v + 1);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 18 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderRelease: (_, g) => {
          if (!profile) return;
          if (g.dx > 50) {
            const moved = onReject(profile);
            if (moved) goNext();
          } else if (g.dx < -50) {
            const moved = onConnect(profile);
            if (moved) goNext();
          }
        },
      }),
    [profile, onReject, onConnect]
  );

  if (!profile) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.hint}>No profiles available right now.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Discover</Text>
      <Text style={styles.hint}>Swipe right to pass • Swipe left to connect</Text>

      <View style={styles.card} {...panResponder.panHandlers}>
        <ScrollView contentContainerStyle={styles.cardScroll} showsVerticalScrollIndicator={false}>
          {profile.photos.map((p, i) => (
            <Image key={`${profile.id}-photo-${i}`} source={{ uri: p }} style={styles.photo} />
          ))}

          <Text style={styles.name}>
            {profile.displayName} • {profile.species} • {profile.ageLabel}
          </Text>
          <Text style={styles.meta}>{profile.distanceKm.toFixed(1)} km away</Text>
          <Text style={styles.bio}>{profile.bio}</Text>

          {profile.prompts.map((pr, i) => (
            <View key={`${profile.id}-prompt-${i}`} style={styles.promptWrap}>
              <Text style={styles.promptQ}>{pr.question}</Text>
              <Text style={styles.promptA}>{pr.answer}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: theme.spacing.md },
  title: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  hint: { color: theme.colors.textSubtle, fontSize: 12 },
  card: { flex: 1, backgroundColor: theme.colors.panel, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
  cardScroll: { padding: 14, gap: 8, paddingBottom: 24 },
  photo: { width: '100%', height: 220, borderRadius: 12, backgroundColor: '#2a1a46' },
  name: { color: theme.colors.text, fontWeight: '800', fontSize: 18, marginTop: 2 },
  bio: { color: theme.colors.textSubtle },
  meta: { color: theme.colors.textSubtle, fontSize: 12 },
  promptWrap: { backgroundColor: '#24153f', borderRadius: 10, padding: 10, gap: 4 },
  promptQ: { color: theme.colors.text, fontWeight: '700' },
  promptA: { color: theme.colors.textSubtle },
});
