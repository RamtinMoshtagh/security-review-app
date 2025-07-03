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
import { Text, ActivityIndicator, useTheme, SegmentedButtons } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';

import { supabase } from '../../lib/supabase';
import { ReviewStackParamList } from '../../navigation/types';
import VenueCard, { VenueCounts } from '../../components/VenueCard';

/* ───────────────────────────────────────── Types */
interface VenueRow {
  venue: string | null;
  rating: 'Good' | 'Okay' | 'Bad';
}
type SortKey = 'reviews' | 'good' | 'bad';

/* ───────────────────────────────────────── Helpers */
const summarise = (rows: VenueRow[]) => {
  const map = new Map<string, VenueCounts>();
  rows.forEach(({ venue, rating }) => {
    if (!venue) return;
    const entry = map.get(venue) ?? { name: venue, total: 0, good: 0, okay: 0, bad: 0 };
    entry.total += 1;
    if (rating === 'Good') entry.good += 1;
    if (rating === 'Okay') entry.okay += 1;
    if (rating === 'Bad') entry.bad += 1;
    map.set(venue, entry);
  });
  return [...map.values()];
};

const sortByKey = (items: VenueCounts[], key: SortKey) =>
  [...items].sort((a, b) => (key === 'reviews' ? b.total - a.total : b[key] - a[key]));

/* ───────────────────────────────────────── Component */
const VenueListScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<ReviewStackParamList>>();

  const [query, setQuery]   = useState('');
  const [sortKey, setSort]  = useState<SortKey>('reviews');
  const [loading, setLoad]  = useState(true);
  const [raw, setRaw]       = useState<VenueCounts[]>([]); // un-filtered, un-sorted

  /* Fetch once */
  useEffect(() => {
    (async () => {
      setLoad(true);
      const { data, error } = await supabase.from('reviews').select('venue,rating');
      if (!error && data) setRaw(summarise(data as VenueRow[]));
      setLoad(false);
    })();
  }, []);

  /* Search + sort memo */
  const results = useMemo(() => {
    const term    = query.trim().toLowerCase();
    const base    = term ? raw.filter(v => v.name.toLowerCase().includes(term)) : raw;
    return sortByKey(base, sortKey);
  }, [query, raw, sortKey]);

  /* Render row */
  const renderItem = ({ item }: { item: VenueCounts }) => (
    <VenueCard
      counts={item}
      onPress={() => navigation.navigate('VenueDetail', { venue: item.name })}
    />
  );

  /* ─────────────────────────────── Render */
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <TextInput
        style={[
          styles.search,
          { color: theme.colors.onSurface, borderColor: theme.colors.outline },
        ]}
        placeholder="Search venues…"
        placeholderTextColor={theme.colors.outline}
        value={query}
        onChangeText={setQuery}
      />

      {/* sort picker */}
      <SegmentedButtons
        value={sortKey}
        onValueChange={(v) => setSort(v as SortKey)}
        buttons={[
          { value: 'good',    label: 'Most 🟢' },
          { value: 'bad',     label: 'Most 🔴' },
        ]}
        density="small"
        style={{ marginHorizontal: 16, marginBottom: 8 }}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 32 }} color={theme.colors.primary} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(v) => v.name}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          ListEmptyComponent={
            <Text style={{ marginTop: 40, textAlign: 'center', color: theme.colors.outline }}>
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
