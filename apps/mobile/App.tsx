import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { fetchChats, fetchDiscoverProfiles, generateFakeProfiles, mockLogin, resetFakeProfiles, swipe, type ChatEntry } from './src/api/client';
import { AuthScreen } from './src/screens/AuthScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { DiscoverScreen } from './src/screens/DiscoverScreen';
import { PetDatingProfile } from './src/mock/profiles';
import { MatchesScreen } from './src/screens/MatchesScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { theme } from './src/theme';

type Tab = 'auth' | 'onboarding' | 'discover' | 'matches' | 'chat' | 'settings';

export default function App() {
  const [tab, setTab] = useState<Tab>('discover');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [ownerId, setOwnerId] = useState('owner-demo');
  const [pendingConnect, setPendingConnect] = useState<PetDatingProfile | null>(null);
  const [chats, setChats] = useState<ChatEntry[]>([]);
  const [profiles, setProfiles] = useState<PetDatingProfile[]>([]);
  const [authWallOpen, setAuthWallOpen] = useState(false);

  const refreshDiscover = async () => {
    const list = await fetchDiscoverProfiles().catch(() => []);
    setProfiles(list);
  };

  useEffect(() => {
    refreshDiscover();
  }, []);

  const refreshChats = async (id: string) => {
    const list = await fetchChats(id).catch(() => []);
    setChats(list);
  };

  const openOrCreateChat = async (profile: PetDatingProfile) => {
    await swipe(ownerId, profile.id, 'left').catch(() => null);
    await refreshChats(ownerId);
    setTab('chat');
  };

  const openAuthWall = (profile?: PetDatingProfile) => {
    if (profile) setPendingConnect(profile);
    setAuthWallOpen(true);
  };

  const handleConnectFromDiscover = (profile: PetDatingProfile) => {
    if (!isLoggedIn) {
      openAuthWall(profile);
      return false;
    }

    openOrCreateChat(profile);
    return true;
  };

  const handleRejectFromDiscover = (profile: PetDatingProfile) => {
    if (!isLoggedIn) {
      openAuthWall();
      return false;
    }
    swipe(ownerId, profile.id, 'right').catch(() => null);
    return true;
  };

  const handleAuthContinue = async () => {
    const session = await mockLogin().catch(() => ({ ownerId: 'owner-demo' }));
    setOwnerId(session.ownerId);
    setIsLoggedIn(true);
    setAuthWallOpen(false);
    await refreshChats(session.ownerId);
    if (pendingConnect) {
      await openOrCreateChat(pendingConnect);
      setPendingConnect(null);
    } else {
      setTab('discover');
    }
  };

  const handleGenerateFakeProfiles = async () => {
    try {
      const res = await generateFakeProfiles();
      await refreshDiscover();
      Alert.alert('Done', `Generated ${res.generated} fake profiles.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not generate fake profiles. Check local server and infra.';
      Alert.alert('Error', message);
    }
  };

  const handleResetFakeProfiles = async () => {
    try {
      await resetFakeProfiles();
      await refreshDiscover();
      setChats([]);
      Alert.alert('Done', 'Generated profiles were reset.');
    } catch {
      Alert.alert('Error', 'Could not reset generated profiles.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.content}>
        {tab === 'auth' ? <AuthScreen onContinue={handleAuthContinue} /> : null}
        {tab === 'onboarding' ? <OnboardingScreen /> : null}
        {tab === 'discover' ? <DiscoverScreen profiles={profiles} onReject={handleRejectFromDiscover} onConnect={handleConnectFromDiscover} /> : null}
        {tab === 'matches' ? <MatchesScreen /> : null}
        {tab === 'chat' ? <ChatScreen chats={chats} /> : null}
        {tab === 'settings' ? <SettingsScreen onGenerateFakeProfiles={handleGenerateFakeProfiles} onResetFakeProfiles={handleResetFakeProfiles} /> : null}
      </View>

      {authWallOpen ? (
        <View style={styles.authWallOverlay}>
          <Pressable style={styles.authWallScrim} onPress={() => setAuthWallOpen(false)} />
          <View style={styles.authWallCard}>
            <Text style={styles.authWallTitle}>Login required</Text>
            <Text style={styles.authWallText}>To start a chat, login or create an account.</Text>
            <View style={styles.authWallActions}>
              <Pressable style={styles.authWallSecondary} onPress={() => setAuthWallOpen(false)}>
                <Text style={styles.authWallSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.authWallPrimary} onPress={() => { setAuthWallOpen(false); setTab('auth'); }}>
                <Text style={styles.authWallPrimaryText}>Login / Create account</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}

      <View style={styles.tabs}>
        {([
          ['onboarding', 'Profile'],
          ['discover', 'Discover'],
          ['matches', 'Matches'],
          ['chat', 'Chat'],
          ['settings', 'Settings'],
        ] as [Exclude<Tab, 'auth'>, string][]).map(([key, label]) => (
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
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4b2a86' },
  dotActive: { width: 18, backgroundColor: theme.colors.accent },
  tabLabel: { color: theme.colors.textSubtle, fontSize: 12 },
  tabLabelActive: { color: theme.colors.text, fontWeight: '800' },
  authWallOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 30 },
  authWallScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  authWallCard: { width: '86%', backgroundColor: theme.colors.panel, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 14, padding: 16, gap: 10 },
  authWallTitle: { color: theme.colors.text, fontSize: 20, fontWeight: '800' },
  authWallText: { color: theme.colors.textSubtle },
  authWallActions: { flexDirection: 'row', gap: 8, marginTop: 6 },
  authWallSecondary: { flex: 1, backgroundColor: '#2a1f42', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  authWallSecondaryText: { color: theme.colors.textSubtle, fontWeight: '700' },
  authWallPrimary: { flex: 1.4, backgroundColor: theme.colors.accent, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  authWallPrimaryText: { color: '#fff', fontWeight: '800' },
});
