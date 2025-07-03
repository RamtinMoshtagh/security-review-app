import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {
  Text,
  useTheme,
  ActivityIndicator,
  Button,
  Chip,
} from 'react-native-paper';
import {
  useRoute,
  RouteProp,
  useNavigation,
  NavigationProp,
} from '@react-navigation/native';

import { supabase, voteReview } from '../../lib/supabase';
import { Database } from '../../types/db';
import { ReviewStackParamList, RootTabParamList } from '../../navigation/types';

/* ──────────────────────────────── Types */
type ReviewRow = Pick<
  Database['public']['Tables']['reviews']['Row'],
  'id' | 'rating' | 'tags' | 'story' | 'created_at' | 'vote_sum'
>;

type RouteT = RouteProp<ReviewStackParamList, 'VenueDetail'>;

interface Metrics {
  good: number;
  okay: number;
  bad: number;
  topTag: string;
  tone: string;
}

/* ──────────────────────────────── Constants */
const PAGE_SIZE = 15;

/* ──────────────────────────────── Component */
const VenueDetailScreen: React.FC = () => {
  const theme       = useTheme();
  const navigation  = useNavigation<NavigationProp<RootTabParamList>>();
  const { params }  = useRoute<RouteT>();
  const { venue }   = params;

  const [metrics,  setMetrics]  = useState<Metrics | null>(null);
  const [reviews,  setReviews]  = useState<ReviewRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cursor,   setCursor]   = useState(0);

  /* ──────────────────────────────── Data fetchers */
  const fetchMetrics = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('rating,tags,tone')
      .eq('venue', venue);

    if (!data) return;

    const tally = { good: 0, okay: 0, bad: 0 };
    const tags  : Record<string, number> = {};
    const tones : Record<string, number> = {};

    data.forEach((r) => {
      if (r.rating === 'Good') tally.good += 1;
      if (r.rating === 'Okay') tally.okay += 1;
      if (r.rating === 'Bad')  tally.bad  += 1;

      (r.tags ?? []).forEach((t) => (tags[t]  = (tags[t]  || 0) + 1));
      if (r.tone) tones[r.tone] = (tones[r.tone] || 0) + 1;
    });

    const topTag  = Object.entries(tags ).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? '—';
    const topTone = Object.entries(tones).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? '—';

    setMetrics({ ...tally, topTag, tone: topTone });
  };

  const fetchPage = async (offset = 0) => {
    const { data } = await supabase
      .from('reviews')
      .select('id,rating,tags,story,created_at,vote_sum')
      .eq('venue', venue)
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (!data) return;
    offset === 0 ? setReviews(data as ReviewRow[]) : setReviews((p) => [...p, ...data]);
  };

  /* ──────────────────────────────── Lifecycle */
  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchMetrics(), fetchPage(0)]);
      setLoading(false);
    })();
  }, [venue]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setCursor(0);
    await Promise.all([fetchMetrics(), fetchPage(0)]);
    setRefreshing(false);
  }, [venue]);

  const loadMore = async () => {
    const next = cursor + PAGE_SIZE;
    await fetchPage(next);
    setCursor(next);
  };

  /* ──────────────────────────────── Voting */
  const handleVote = async (id: string, delta: 1 | -1) => {
    try {
      const newSum = await voteReview(id, delta);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, vote_sum: newSum } : r)),
      );
    } catch (err) {
      console.error('Vote failed', err);
    }
  };

  /* ──────────────────────────────── Render helpers */
  const ReviewCard = ({ item }: { item: ReviewRow }) => (
    <View style={[styles.reviewCard, { backgroundColor: theme.colors.surfaceVariant }]}>
      <Text style={styles.reviewHeader}>
        {item.rating === 'Good' ? '🟢' : item.rating === 'Okay' ? '🟡' : '🔴'} •{' '}
        {new Date(item.created_at).toLocaleDateString()}
      </Text>

      <View style={styles.tagRow}>
        {(item.tags ?? []).map((t) => (
          <Chip key={t} style={styles.tag}>{t}</Chip>
        ))}
      </View>

      <Text numberOfLines={3} style={{ color: theme.colors.onSurface, marginBottom: 12 }}>
        {item.story}
      </Text>

      <View style={styles.voteRow}>
        <Button icon="thumb-up-outline" compact onPress={() => handleVote(item.id, +1)} children={undefined} />
        <Text style={styles.voteSum}>{item.vote_sum ?? 0}</Text>
        <Button icon="thumb-down-outline" compact onPress={() => handleVote(item.id, -1)} children={undefined} />
      </View>
    </View>
  );

  /* ──────────────────────────────── Render */
  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={styles.venueName}>{venue}</Text>
        {metrics && (
          <>
            <View style={styles.metricsRow}>
              <Text style={styles.metric}>🟢 {metrics.good}</Text>
              <Text style={styles.metric}>🟡 {metrics.okay}</Text>
              <Text style={styles.metric}>🔴 {metrics.bad}</Text>
            </View>
            <Text style={styles.subMetric}>🚩 {metrics.topTag} • 💬 {metrics.tone}</Text>
          </>
        )}
      </View>

      {/* List */}
      <FlatList
        data={reviews}
        keyExtractor={(r) => r.id}
        renderItem={ReviewCard}
        contentContainerStyle={{ padding: 16 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
        ListFooterComponent={
          reviews.length >= PAGE_SIZE ? <ActivityIndicator color={theme.colors.primary} /> : null
        }
      />

      {/* CTA */}
      <Button
        mode="contained"
        style={styles.cta}
        onPress={() =>
          navigation.navigate('ReviewStack', {
            screen: 'ReviewFlow',
            params: { prefillVenue: venue },
          } as any)
        }
      >
        Add your review
      </Button>
    </SafeAreaView>
  );
};

export default VenueDetailScreen;

/* ──────────────────────────────── Styles */
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  center:   { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ffffff22',
  },
  venueName:  { fontSize: 24, fontWeight: '700' },
  metricsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  metric:     { fontSize: 16 },
  subMetric:  { marginTop: 4, color: '#CCCCCC' },

  reviewCard:  { borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3 },
  reviewHeader:{ fontWeight: '600', marginBottom: 4 },
  tagRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
  tag:         { height: 24 },

  voteRow:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  voteSum:   { minWidth: 28, textAlign: 'center', fontWeight: '600' },

  cta: { position: 'absolute', bottom: 32, alignSelf: 'center', width: '70%', borderRadius: 24 },
});
