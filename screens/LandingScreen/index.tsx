import React, { useEffect, useState } from 'react';
import {
  View,
  SafeAreaView,
  Platform,
  StatusBar,
  StyleSheet,
  LayoutAnimation,
} from 'react-native';
import { Text, Button, useTheme, ActivityIndicator } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { getInsights } from '../../lib/supabase';
import { RootTabParamList } from '../../navigation/types';

type Insights = {
  mostReviewedVenue: string;
  mostFlaggedTag: string;
  avgTone: string;
};

const initialInsights: Insights = {
  mostReviewedVenue: 'Loading…',
  mostFlaggedTag: 'Loading…',
  avgTone: 'Loading…',
};

/**
 * Landing / Home screen – welcomes user and shows small community stats.
 */
const LandingScreen: React.FC = () => {
  const theme  = useTheme();
  const navigation = useNavigation<NavigationProp<RootTabParamList>>();

  const [insights, setInsights] = useState<Insights>(initialInsights);
  const [loading,  setLoading ] = useState(true);

  // ────────────────────────────────────────────────────────── Fetch quick stats
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { mostReviewedVenue, mostFlaggedTag, avgTone } = await getInsights();
        setInsights({ mostReviewedVenue, mostFlaggedTag, avgTone });
      } catch (err) {
        console.error('Error fetching insights', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ────────────────────────────────────────────────────────── CTA handlers
  const handleStartReview = () => {
    LayoutAnimation.easeInEaseOut();
    Haptics.selectionAsync();
    navigation.navigate('ReviewStack', { screen: 'ReviewFlow' });
  };

  const handleReadReviews = () => {
    LayoutAnimation.easeInEaseOut();
    Haptics.selectionAsync();
    navigation.navigate('ReviewStack', { screen: 'VenueList' });
  };

  // ────────────────────────────────────────────────────────── UI
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.container}>
        {/* Hero copy + CTAs */}
        <View style={styles.hero}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            Welcome to NightCheck
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.outline }]}>
            Share your experience with nightclub security and help others stay safe. Your voice helps shift the culture.
          </Text>

          <Button
            mode="contained"
            onPress={handleStartReview}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            contentStyle={{ paddingVertical: 10 }}
            labelStyle={{ color: theme.colors.onPrimary, fontWeight: '600', fontSize: 16 }}
          >
            Start Review →
          </Button>

          <Button
            mode="outlined"
            onPress={handleReadReviews}
            style={[styles.button, { marginTop: 12, borderColor: theme.colors.primary }]}
            contentStyle={{ paddingVertical: 10 }}
            labelStyle={{ color: theme.colors.primary, fontWeight: '600', fontSize: 16 }}
          >
            Read Reviews
          </Button>
        </View>

        {/* Quick insights */}
        <View style={styles.insights}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Quick Insights
          </Text>

          {loading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <>
              <StatRow label="📍 Most reviewed venue" value={insights.mostReviewedVenue} />
              <StatRow label="⚠️ Most flagged issue" value={insights.mostFlaggedTag} />
              <StatRow label="💬 Avg. tone"            value={insights.avgTone} />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LandingScreen;

// ────────────────────────────────────────────────────────── Helper
function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <Text style={styles.stat}>
      {label}: <Text style={styles.statHighlight}>{value}</Text>
    </Text>
  );
}

// ────────────────────────────────────────────────────────── Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  hero: {
    marginTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    borderRadius: 24,
    alignSelf: 'center',
    width: '75%',
  },
  insights: {
    marginTop: 40,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  stat: {
    fontSize: 15,
    marginBottom: 6,
    textAlign: 'center',
    color: '#CCCCCC',
  },
  statHighlight: {
    color: '#FF8870',
    fontWeight: '600',
  },
});
