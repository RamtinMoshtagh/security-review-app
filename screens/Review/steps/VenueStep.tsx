import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import * as Haptics from 'expo-haptics';

import { supabase } from '../../../lib/supabase';
import { useReviewStore } from '../../../store/useReviewStore';

type VenueInsert = { name: string | null };

interface Props {
  onNext: () => void;
}

const normalise = (name: string) =>
  name
    .trim()
    .replace(/[’']/g, "'")
    .replace(/\s+/g, ' ')
    .toLowerCase();

/**
 * Step 1 – Pick or create a venue.
 */
const VenueStep: React.FC<Props> = ({ onNext }) => {
  const theme = useTheme();
  const { venue, setVenue } = useReviewStore();

  const [allVenues, setAllVenues] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // ────────────────────────────────────────────────────────── Fetch venues
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from('venues').select('name');
      if (!error && data) {
        const uniq = new Map<string, string>();
        data.forEach((v: VenueInsert) => {
          if (v.name) {
            const key = normalise(v.name);
            if (!uniq.has(key)) uniq.set(key, v.name);
          }
        });
        setAllVenues(Array.from(uniq.values()));
      }
      setLoading(false);
    })();
  }, []);

  const filtered = allVenues.filter((v) =>
    v.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ────────────────────────────────────────────────────────── Select handler
  const handleSelect = async (selectedRaw: string) => {
    const selected = selectedRaw.startsWith('Add "') ? searchTerm.trim() : selectedRaw;
    if (!selected) return;

    setVenue(selected);
    Haptics.selectionAsync();

    if (!allVenues.some((v) => normalise(v) === normalise(selected))) {
      const { error } = await supabase.from('venues').insert([{ name: selected }]);
      if (!error) setAllVenues((prev) => [...prev, selected]);
    }

    onNext();
  };

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() => handleSelect(item)}
      style={[
        styles.card,
        { backgroundColor: venue === item ? theme.colors.primary : theme.colors.surface },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Select venue ${item}`}
    >
      <Text style={{ color: theme.colors.onSurface, fontWeight: '600', textAlign: 'center' }}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  // ────────────────────────────────────────────────────────── UI
  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.label, { color: theme.colors.onSurface }]}>
        Which venue are you reviewing?
      </Text>

      <RNTextInput
        style={[
          styles.input,
          { color: theme.colors.onSurface, borderColor: theme.colors.outline },
        ]}
        placeholder="Search for a venue…"
        placeholderTextColor={theme.colors.outline}
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {loading ? (
        <Text style={styles.loading}>Loading venues…</Text>
      ) : (
        <FlatList
          data={filtered.length > 0 ? filtered : [`Add "${searchTerm}"`]}
          keyExtractor={(item) => item}
          numColumns={2}
          renderItem={renderItem}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
        />
      )}
    </View>
  );
};

export default VenueStep;

// ────────────────────────────────────────────────────────── Styles
const styles = StyleSheet.create({
  label: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  loading: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#AAAAAA',
  },
  grid: {
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    flex: 1,
    margin: 8,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
