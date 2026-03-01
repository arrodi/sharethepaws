import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { AuthScreen } from './src/screens/AuthScreen';
import { FeedScreen } from './src/screens/FeedScreen';
import { MessagesScreen } from './src/screens/MessagesScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { theme } from './src/theme';

type Tab = 'auth' | 'profile' | 'feed' | 'messages';

export default function App() {
  const [tab, setTab] = useState<Tab>('feed');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        {tab === 'auth' ? <AuthScreen /> : null}
        {tab === 'profile' ? <ProfileScreen /> : null}
        {tab === 'feed' ? <FeedScreen /> : null}
        {tab === 'messages' ? <MessagesScreen /> : null}
      </View>

      <View style={styles.tabs}>
        {([
          ['auth', 'Auth'],
          ['profile', 'Pets'],
          ['feed', 'Feed'],
          ['messages', 'DMs'],
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
