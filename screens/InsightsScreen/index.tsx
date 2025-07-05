// screens/InsightsScreen/index.tsx
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {
  Text,
  ActivityIndicator,
  useTheme,
  Card,
  Divider,
  Chip,
  IconButton,
  Switch,
} from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';

import {
  getInsights,
  getTopVenuesByRating,
  getBestVibeVenue,
  VibeRow,
} from '../../lib/supabase';
import VenueRankList, { RankedVenue } from '../../components/VenueRankList';
import { RootTabParamList } from '../../navigation/types';

interface Stats { avgTone: string; totalReviews: number }
interface FeedItem { tag: string; venue: string; minutesAgo: number }

export default function InsightsScreen() {
  const theme = useTheme();
  const nav   = useNavigation<NavigationProp<RootTabParamList>>();

  const [stats,     setStats]     = useState<Stats>({ avgTone: '…', totalReviews: 0 });
  const [best,      setBest]      = useState<RankedVenue[]>([]);
  const [worst,     setWorst]     = useState<RankedVenue[]>([]);
  const [feed,      setFeed]      = useState<FeedItem[]>([]);
  const [vibe,      setVibe]      = useState<VibeRow | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [errorMsg,  setErrorMsg]  = useState<string | null>(null);
  const [notify,    setNotify]    = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string>('');

  const refresh = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [ins, top, bot, vibeRow] = await Promise.all([
        getInsights(),
        getTopVenuesByRating('Good', 10),
        getTopVenuesByRating('Bad', 10),
        getBestVibeVenue(),
      ]);
      setStats(ins);
      setBest(top);
      setWorst(bot);
      setVibe(vibeRow);
      setFeed([
        { tag: 'Friendly',   venue: top[0]?.venue ?? '—', minutesAgo: 5  },
        { tag: 'Aggressive', venue: bot[0]?.venue ?? '—', minutesAgo: 12 },
        { tag: 'Calm',       venue: top[1]?.venue ?? '—', minutesAgo: 20 },
      ]);
      setUpdatedAt(new Date().toLocaleTimeString());
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const handleSelect = (venue: string) =>
    nav.navigate('ReviewStack', { screen: 'VenueDetail', params: { venue } } as any);

  const vibeColor = (score: number) =>
    score >= 80 ? theme.colors.primary
    : score >= 60 ? '#4caf50'
    : score >= 40 ? '#ffb300'
    : theme.colors.error;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        {errorMsg && <Text style={{ color: theme.colors.error, marginTop: 12 }}>{errorMsg}</Text>}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header & timestamp */}
        <View style={styles.headerRow}>
          <Text style={[styles.header, { color: theme.colors.onSurface }]}>
            Your Security Snapshot
          </Text>
          <IconButton icon="refresh" size={20} onPress={refresh} />
        </View>
        <Text style={[styles.updated, { color: theme.colors.outline }]}>
          Last updated: {updatedAt}
        </Text>
        <Divider style={styles.divider} />

        {/* Security Vibes Tonight */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.outline }]}>
            👮‍♂️ Security Vibes Tonight
          </Text>
          {vibe ? (
            <View>
              <Text style={[styles.cardValue, { color: vibeColor(vibe.vibe_score) }]}>
                {vibe.vibe_label} · {vibe.vibe_score}
              </Text>
              <Text style={[styles.smallText, { color: theme.colors.onSurface }]}>
                Based on today’s reviews at {vibe.venue_id}
              </Text>
            </View>
          ) : (
            <Text style={[styles.smallText, { color: theme.colors.onSurface }]}>
              Not enough reviews yet — check back later!
            </Text>
          )}
        </Card>

        {/* Pulse Meter */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.outline }]}>
            Live Pulse Meter
          </Text>
          <View style={styles.pulseBg}>
            <View
              style={[
                styles.pulseFill,
                { width: `${Math.min(stats.totalReviews / 10, 10) * 10}%` },
              ]}
            />
          </View>
          <Text style={[styles.smallText, { color: theme.colors.onSurface }]}>
            {stats.totalReviews} total tags
          </Text>
        </Card>

        {/* Trending Tags */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.outline }]}>
            Trending Tags
          </Text>
          <View style={styles.wordCloud}>
            {['Respectful','Calm','Aggressive','Racial profiling','Friendly'].map(tag => (
              <Chip
                key={tag}
                mode="outlined"
                style={[styles.cloudChip, { borderColor: theme.colors.primary, paddingVertical: 10 }]}
                textStyle={{ color: theme.colors.primary, fontWeight: '600', fontSize: 14 }}
              >
                {tag}
              </Chip>
            ))}
          </View>
        </Card>

        {/* Mini-Feed */}
        <View style={styles.feedContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            What Your Friends Are Saying
          </Text>
          <FlatList
            data={feed}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <View style={[styles.feedItem, { backgroundColor: theme.colors.surface }]}>
                <Text style={{ color: theme.colors.primary }}>Someone</Text>
                <Text style={{ color: theme.colors.onSurface }}>
                  tagged '{item.tag}' at {item.venue} {item.minutesAgo}m ago
                </Text>
              </View>
            )}
            scrollEnabled={false}
          />
        </View>

        {/* Rankings */}
        <VenueRankList
          title="🏆 Top-Rated Venues"
          data={best}
          variant="best"
          onSelect={handleSelect}
        />
        <VenueRankList
          title="🚩 Most Complaints"
          data={worst}
          variant="worst"
          onSelect={handleSelect}
        />

        {/* Share & Notifications */}
        <TouchableOpacity style={[styles.cta, { backgroundColor: theme.colors.primary }]}>
          <Text style={[styles.ctaText, { color: theme.colors.onPrimary }]}>
            Share this Snapshot
          </Text>
        </TouchableOpacity>
        <View style={styles.notifyRow}>
          <Text style={{ color: theme.colors.onSurface }}>🔔 Notify me on drops</Text>
          <Switch value={notify} onValueChange={setNotify} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : StatusBar.currentHeight },
  container: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: '700' },
  updated: { marginTop: 4, marginBottom: 12, fontSize: 12 },
  divider: { marginVertical: 8 },
  card: { borderRadius: 16, padding: 12, marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  cardValue: { fontSize: 20, fontWeight: '700' },
  smallText: { fontSize: 12, marginTop: 4 },
  pulseBg: { height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden', marginVertical: 8 },
  pulseFill: { height: '100%', backgroundColor: '#4caf50' },
  wordCloud: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: 8 },
  cloudChip: { margin: 4 },
  feedContainer: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  feedItem: { padding: 8, borderRadius: 12, marginBottom: 8 },
  cta: { borderRadius: 24, paddingVertical: 12, alignItems: 'center', marginTop: 24 },
  ctaText: { fontSize: 16, fontWeight: '600' },
  notifyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingHorizontal: 16 },
});
