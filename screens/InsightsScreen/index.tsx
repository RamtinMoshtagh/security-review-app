import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
  View,
} from 'react-native';
import { Text, ActivityIndicator, useTheme } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';

import { getInsights, getTopVenuesByRating } from '../../lib/supabase';
import VenueRankList, { RankedVenue } from '../../components/VenueRankList';
import { RootTabParamList } from '../../navigation/types';

interface Stats {
  mostReviewedVenue: string;
  mostFlaggedTag: string;
  avgTone: string;
  totalReviews: number;
  bestVenues: RankedVenue[];
  worstVenues: RankedVenue[];
}

const initialStats: Stats = {
  mostReviewedVenue: 'Loading…',
  mostFlaggedTag: 'Loading…',
  avgTone: 'Loading…',
  totalReviews: 0,
  bestVenues: [],
  worstVenues: [],
};

/**
 * Community insights screen.
 * Ranking lists first, high-level metrics after.
 */
const InsightsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootTabParamList>>();
  const [stats, setStats] = useState<Stats>(initialStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const insightPromise = getInsights();
        const bestPromise = getTopVenuesByRating('Good');
        const worstPromise = getTopVenuesByRating('Bad');

        const [
          { mostReviewedVenue, mostFlaggedTag, avgTone, totalReviews },
          bestVenues,
          worstVenues,
        ] = await Promise.all([insightPromise, bestPromise, worstPromise]);

        setStats({
          mostReviewedVenue,
          mostFlaggedTag,
          avgTone,
          totalReviews,
          bestVenues,
          worstVenues,
        });
      } catch (err) {
        console.error('Error fetching insights', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelectVenue = (venue: string) => {
    navigation.navigate('ReviewStack', {
      screen: 'ReviewFlow',
      params: { prefillVenue: venue },
    } as any);
  };

  // ────────────────────────────────────────────────────────── Render
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>Community Insights</Text>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <>
            {/* 1️⃣ Ranking lists first */}
            <VenueRankList
              title="🏆 Top-Rated Venues"
              data={stats.bestVenues}
              variant="best"
              onSelect={handleSelectVenue}
            />

            <VenueRankList
              title="🚩 Most Complaints"
              data={stats.worstVenues}
              variant="worst"
              onSelect={handleSelectVenue}
            />

            {/* 2️⃣ High-level stats */}
            <InsightCard label="📍 Most Reviewed Venue" value={stats.mostReviewedVenue} />
            <InsightCard label="⚠️ Most Flagged Issue" value={stats.mostFlaggedTag} />
            <InsightCard label="💬 Average Tone" value={stats.avgTone} />
            <InsightCard label="📝 Total Reviews Logged" value={stats.totalReviews.toString()} />

            <Text style={styles.footer}>Live from the NightCheck community 🚨</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default InsightsScreen;

// ────────────────────────────────────────────────────────── Helper component
function InsightCard({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.cardLabel, { color: theme.colors.outline }]}>{label}</Text>
      <Text style={[styles.cardValue, { color: theme.colors.onSurface }]}>{value}</Text>
    </View>
  );
}

// ────────────────────────────────────────────────────────── Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 24,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 14,
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    color: '#AAAAAA',
    fontSize: 13,
    textAlign: 'center',
  },
});
