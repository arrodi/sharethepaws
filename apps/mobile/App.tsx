import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { AuthScreen } from './src/screens/AuthScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { DiscoverScreen } from './src/screens/DiscoverScreen';
import { PetDatingProfile } from './src/mock/profiles';
import { MatchesScreen } from './src/screens/MatchesScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { theme } from './src/theme';

type Tab = 'auth' | 'onboarding' | 'discover' | 'matches' | 'chat';

export default function App() {
  const [tab, setTab] = useState<Tab>('discover');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pendingConnect, setPendingConnect] = useState<PetDatingProfile | null>(null);
  const [chats, setChats] = useState<PetDatingProfile[]>([]);
  const [authWallOpen, setAuthWallOpen] = useState(false);

  const openOrCreateChat = (profile: PetDatingProfile) => {
    setChats((prev) => (prev.some((p) => p.id === profile.id) ? prev : [profile, ...prev]));
    setTab('chat');
  };

  const openAuthWall = (profile?: PetDatingProfile) => {
    if (profile) setPendingConnect(profile);
    setAuthWallOpen(true);
  };

  const handleRejectFromDiscover = (_profile: PetDatingProfile) => {
    if (!isLoggedIn) {
      openAuthWall();
      return false;
    }
    return true;
  };

  const handleConnectFromDiscover = (profile: PetDatingProfile) => {
    if (!isLoggedIn) {
      openAuthWall(profile);
      return;
    }

    openOrCreateChat(profile);
  };

  const handleAuthContinue = () => {
    setIsLoggedIn(true);
    setAuthWallOpen(false);
    if (pendingConnect) {
      openOrCreateChat(pendingConnect);
      setPendingConnect(null);
    } else {
      setTab('discover');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.content}>
        {tab === 'auth' ? <AuthScreen onContinue={handleAuthContinue} /> : null}
        {tab === 'onboarding' ? <OnboardingScreen /> : null}
        {tab === 'discover' ? <DiscoverScreen onReject={handleRejectFromDiscover} onConnect={handleConnectFromDiscover} /> : null}
        {tab === 'matches' ? <MatchesScreen /> : null}
        {tab === 'chat' ? <ChatScreen chats={chats} /> : null}
      </View>

      {authWallOpen ? (
        <View style={styles.authWallOverlay}>
          <Pressable style={styles.authWallScrim} onPress={() => setAuthWallOpen(false)} />
          <View style={styles.authWallCard}>
            <Text style={styles.authWallTitle}>Login required</Text>
            <Text style={styles.authWallText}>Create an account or login to swipe and chat.</Text>
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
