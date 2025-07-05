// components/FilteredVenueList.tsx
import React, { useEffect, useState } from 'react';
import { FlatList, ActivityIndicator, View, Text } from 'react-native';
import { useTheme } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import VenueCard, { VenueCounts } from './VenueCard';

export type Filter = 'good' | 'bad' | `tag:${string}`;

function summarise(rows: { venue: string | null; rating: 'Good' | 'Okay' | 'Bad' }[]) {
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
  return Array.from(map.values());
}

export default function FilteredVenueList({
  filter,
  onPress,
}: {
  /** If undefined, shows all reviews. 'good' = only Good, 'bad' = only Bad, 'tag:Respectful' etc. */
  filter?: Filter;
  onPress: (venue: string) => void;
}) {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState<VenueCounts[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let query = supabase.from('reviews').select('venue,rating,tags');
      if (filter === 'good') query = query.eq('rating', 'Good');
      else if (filter === 'bad') query = query.eq('rating', 'Bad');
      else if (filter?.startsWith('tag:')) {
        const tag = filter.slice(4);
        query = query.contains('tags', [tag]);
      }
      const { data, error } = await query;
      if (!error && data) {
        // cast to our simple type
        const simple = (data as any[]).map((r) => ({
          venue: r.venue as string | null,
          rating: r.rating as 'Good' | 'Okay' | 'Bad',
        }));
        setVenues(summarise(simple));
      }
      setLoading(false);
    })();
  }, [filter]);

  if (loading) {
    return <ActivityIndicator color={theme.colors.primary} />;
  }

  if (venues.length === 0) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: theme.colors.outline, textAlign: 'center' }}>
          No venues found
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={venues}
      keyExtractor={(v) => v.name}
      renderItem={({ item }) => (
        <VenueCard
          counts={item}
          onPress={() => onPress(item.name)}
        />
      )}
      // if embedding in a ScrollView, disable its own scrolling
      scrollEnabled={false}
    />
  );
}
