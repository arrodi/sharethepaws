import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { ChatScreen } from './src/screens/ChatScreen';
import { DiscoverScreen } from './src/screens/DiscoverScreen';
import { MatchesScreen } from './src/screens/MatchesScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { theme } from './src/theme';

type Tab = 'onboarding' | 'discover' | 'matches' | 'chat';

export default function App() {
  const [tab, setTab] = useState<Tab>('discover');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        {tab === 'onboarding' ? <OnboardingScreen /> : null}
        {tab === 'discover' ? <DiscoverScreen /> : null}
        {tab === 'matches' ? <MatchesScreen /> : null}
        {tab === 'chat' ? <ChatScreen /> : null}
      </View>

      <View style={styles.tabs}>
        {([
          ['onboarding', 'Profile'],
          ['discover', 'Discover'],
          ['matches', 'Matches'],
          ['chat', 'Chat'],
        ] as [Tab, string][]).map(([key, label]) => (
          <Pressable key={key} style={styles.tab} onPress={() => setTab(key)}>
            <View style={[styles.dot, tab === key && styles.dotActive]} />
            <Text style={[styles.tabLabel, tab === key && styles.tabLabelActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.bg },
  content: { flex: 1, padding: theme.spacing.lg },
  tabs: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.panel,
    paddingVertical: 10,
  },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#90c89e' },
  dotActive: { width: 18, backgroundColor: theme.colors.accent },
  tabLabel: { color: theme.colors.textSubtle, fontSize: 12 },
  tabLabelActive: { color: theme.colors.text, fontWeight: '800' },
});
