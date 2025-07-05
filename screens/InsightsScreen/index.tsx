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

import { getInsights, getTopVenuesByRating } from '../../lib/supabase';
import VenueRankList, { RankedVenue } from '../../components/VenueRankList';
import StackedBar from '../../components/StackedBar';
import { RootTabParamList } from '../../navigation/types';

interface Stats { avgTone: string; totalReviews: number; }
interface FeedItem { tag: string; venue: string; minutesAgo: number; }

export default function InsightsScreen() {
  const theme = useTheme();
  const nav = useNavigation<NavigationProp<RootTabParamList>>();

  const [stats, setStats] = useState<Stats>({ avgTone: '…', totalReviews: 0 });
  const [best, setBest] = useState<RankedVenue[]>([]);
  const [worst, setWorst] = useState<RankedVenue[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notify, setNotify] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string>('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [ins, top, bot] = await Promise.all([
        getInsights(),
        getTopVenuesByRating('Good', 10),
        getTopVenuesByRating('Bad', 10),
      ]);
      setStats(ins);
      setBest(top);
      setWorst(bot);
      setFeed([
        { tag: 'Friendly', venue: top[0]?.venue ?? '—', minutesAgo: 5 },
        { tag: 'Aggressive', venue: bot[0]?.venue ?? '—', minutesAgo: 12 },
        { tag: 'Calm', venue: top[1]?.venue ?? '—', minutesAgo: 20 },
      ]);
      setUpdatedAt(new Date().toLocaleTimeString());
      setLoading(false);
    })();
  }, []);

  const goToReview = () =>
    nav.navigate('ReviewStack', { screen: 'ReviewFlow' } as any);
  const showHotSpots = () =>
    nav.navigate('ReviewStack', { screen: 'VenueList', params: { filter: 'good' } } as any);
  const showAvoid = () =>
    nav.navigate('ReviewStack', { screen: 'VenueList', params: { filter: 'bad' } } as any);
  const handleSelect = (venue: string) =>
    nav.navigate('ReviewStack', { screen: 'VenueDetail', params: { venue } } as any);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
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
          <IconButton
            icon="refresh"
            size={20}
            onPress={() => {
              setUpdatedAt(new Date().toLocaleTimeString());
              setLoading(true);
              getInsights().then(ins => {
                setStats(ins);
                setLoading(false);
              });
            }}
          />
        </View>
        <Text style={[styles.updated, { color: theme.colors.outline }]}>
          Last updated: {updatedAt}
        </Text>
        <Divider style={styles.divider} />

        {/* Mood Spotlight */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.outline }]}>
            👮‍♂️ Security Vibes Tonight
          </Text>
          <Text style={[styles.cardValue, { color: theme.colors.onSurface }]}>
            '{stats.avgTone}'
          </Text>
          <Text style={[styles.smallText, { color: theme.colors.onSurface }]}>
            “1 in 2 tagged bouncers as 🔥. Arrive early to skip the drama.”
          </Text>
        </Card>

        {/* Pulse Meter */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.outline }]}>
            Live Pulse Meter
          </Text>
          <View style={styles.pulseBg}>
            <View style={[styles.pulseFill, { width: `${Math.min((stats.totalReviews/10)*100,100)}%` }]} />
          </View>
          <Text style={[styles.smallText, { color: theme.colors.onSurface }]}>
            {stats.totalReviews} total tags
          </Text>
        </Card>

        {/* Word Cloud */}
<Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
  <Text style={[styles.cardTitle, { color: theme.colors.outline }]}>
    Trending Tags
  </Text>
  <View style={styles.wordCloud}>
    {['Respectful','Calm','Aggressive','Racial profiling','Friendly'].map(
      (tag) => (
        <Chip
          key={tag}
          mode="outlined"
          style={[
            styles.cloudChip,
            { borderColor: theme.colors.primary, paddingVertical: 10 },
          ]}
          textStyle={{
            color: theme.colors.primary,
            fontWeight: '600',
            fontSize: 14,
          }}
        >
          {tag}
        </Chip>
      )
    )}
  </View>
</Card>

        {/* Mini-Feed (vertical) */}
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

        {/* Venue Rankings */}
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
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : StatusBar.currentHeight,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: { fontSize: 24, fontWeight: '700' },
  updated: { marginTop: 4, marginBottom: 12, fontSize: 12 },
  divider: { marginVertical: 8 },
  card: { borderRadius: 16, padding: 12, marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  cardValue: { fontSize: 20, fontWeight: '700' },
  smallText: { fontSize: 12, marginTop: 4 },
  pulseBg: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 8,
  },
  pulseFill: { height: '100%', backgroundColor: '#4caf50' },
  wordCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 8,
  },
  cloudChip: { margin: 4 },
  feedContainer: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  feedItem: { padding: 8, borderRadius: 12, marginBottom: 8 },
  cta: { borderRadius: 24, paddingVertical: 12, alignItems: 'center', marginTop: 24 },
  ctaText: { fontSize: 16, fontWeight: '600' },
  notifyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
  },
});
