// screens/VenueListScreen/index.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  FlatList,
  TextInput,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import {
  Text,
  ActivityIndicator,
  useTheme,
  SegmentedButtons,
} from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';

import { supabase } from '../../lib/supabase';
import { ReviewStackParamList } from '../../navigation/types';
import VenueCard, { VenueCounts } from '../../components/VenueCard';

/* ───────────────────────────────────────── Types */
interface VenueRow {
  venue: string | null;
  rating: 'Good' | 'Okay' | 'Bad';
}
// Now only two sort modes
type SortKey = 'good' | 'bad';

/* ───────────────────────────────────────── Helpers */
const summarise = (rows: VenueRow[]) => {
  const map = new Map<string, VenueCounts>();
  rows.forEach(({ venue, rating }) => {
    if (!venue) return;
    const entry =
      map.get(venue) ??
      ({ name: venue, total: 0, good: 0, okay: 0, bad: 0 } as VenueCounts);
    entry.total += 1;
    if (rating === 'Good') entry.good += 1;
    if (rating === 'Okay') entry.okay += 1;
    if (rating === 'Bad') entry.bad += 1;
    map.set(venue, entry);
  });
  return [...map.values()];
};

const sortByMode = (items: VenueCounts[], key: SortKey) =>
  [...items].sort((a, b) => b[key] - a[key]);

/* ───────────────────────────────────────── Component */
const VenueListScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<ReviewStackParamList>>();

  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SortKey>('good');
  const [loading, setLoading] = useState(true);
  const [raw, setRaw] = useState<VenueCounts[]>([]);

  /* Fetch once */
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('venue,rating');
      if (!error && data) {
        setRaw(summarise(data as VenueRow[]));
      }
      setLoading(false);
    })();
  }, []);

  /* Search → Sort */
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = term
      ? raw.filter((v) => v.name.toLowerCase().includes(term))
      : raw;
    return sortByMode(filtered, mode);
  }, [raw, query, mode]);

  const renderItem = ({ item }: { item: VenueCounts }) => (
    <VenueCard
      counts={item}
      onPress={() =>
        navigation.navigate('VenueDetail', { venue: item.name })
      }
    />
  );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      {/* Search Bar */}
      <TextInput
        style={[
          styles.search,
          {
            color: theme.colors.onSurface,
            borderColor: theme.colors.outline,
          },
        ]}
        placeholder="Search venues…"
        placeholderTextColor={theme.colors.outline}
        value={query}
        onChangeText={setQuery}
      />

      {/* Only two modes: Most 🟢 or Most 🔴 */}
      <SegmentedButtons
        value={mode}
        onValueChange={(v) => setMode(v as SortKey)}
        buttons={[
          { value: 'good', label: 'Most 🟢' },
          { value: 'bad', label: 'Most 🔴' },
        ]}
        density="small"
        style={{ marginHorizontal: 16, marginBottom: 8 }}
      />

      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 32 }}
          color={theme.colors.primary}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(v) => v.name}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 24,
          }}
          ListEmptyComponent={
            <Text
              style={{
                marginTop: 40,
                textAlign: 'center',
                color: theme.colors.outline,
              }}
            >
              No venues found
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default VenueListScreen;

/* ───────────────────────────────────────── Styles */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  search: {
    margin: 16,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 44,
    fontSize: 16,
  },
});
