import { useMemo, useRef, useState } from 'react';
import { Animated, Image, PanResponder, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PetDatingProfile } from '../mock/profiles';
import { theme } from '../theme';

type Props = {
  profiles: PetDatingProfile[];
  onReject: (profile: PetDatingProfile) => boolean;
  onConnect: (profile: PetDatingProfile) => boolean;
};

export function DiscoverScreen({ profiles, onReject, onConnect }: Props) {
  const [index, setIndex] = useState(0);
  const drag = useRef(new Animated.ValueXY()).current;

  const profile = useMemo(
    () => (profiles.length ? profiles[index % profiles.length] : null),
    [index, profiles]
  );

  const goNext = () => setIndex((v) => v + 1);

  const resetCard = () => {
    Animated.spring(drag, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      friction: 7,
      tension: 70,
    }).start();
  };

  const swipeOut = (direction: 'left' | 'right', onDone: () => void) => {
    Animated.timing(drag, {
      toValue: { x: direction === 'left' ? -420 : 420, y: 0 },
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      drag.setValue({ x: 0, y: 0 });
      onDone();
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderMove: Animated.event([null, { dx: drag.x, dy: drag.y }], { useNativeDriver: false }),
        onPanResponderRelease: (_, g) => {
          if (!profile) return;
          if (g.dx > 90) {
            const moved = onReject(profile);
            if (moved) swipeOut('right', goNext);
            else resetCard();
          } else if (g.dx < -90) {
            const moved = onConnect(profile);
            if (moved) swipeOut('left', goNext);
            else resetCard();
          } else {
            resetCard();
          }
        },
      }),
    [drag.x, drag.y, profile, onReject, onConnect]
  );

  const rotate = drag.x.interpolate({
    inputRange: [-220, 0, 220],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

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

      <Animated.View
        style={[styles.card, { transform: [{ translateX: drag.x }, { translateY: drag.y }, { rotate }] }]}
        {...panResponder.panHandlers}
      >
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
      </Animated.View>
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
