import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import * as Haptics from 'expo-haptics';

import { useReviewStore } from '../../../store/useReviewStore';

const ratingOptions = [
  { label: 'Good', emoji: '🟢' },
  { label: 'Okay', emoji: '🟡' },
  { label: 'Bad', emoji: '🔴' },
] as const;

type RatingLabel = (typeof ratingOptions)[number]['label'];

/**
 * Step 2 – Choose a simple traffic‑light rating.
 * Pure presentational component; parent handles navigation.
 */
const RatingStep: React.FC = () => {
  const theme = useTheme();
  const { rating, setRating } = useReviewStore();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme.colors.onSurface }]}>How did the security treat you?</Text>

      <View style={styles.optionRow}>
        {ratingOptions.map((opt) => {
          const selected = rating === opt.label;
          return (
            <TouchableOpacity
              key={opt.label}
              onPress={() => {
                setRating(opt.label as RatingLabel);
                Haptics.selectionAsync();
              }}
              style={[
                styles.card,
                {
                  backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`Rate as ${opt.label}`}
            >
              <Text style={styles.emoji}>{opt.emoji}</Text>
              <Text style={{ color: theme.colors.onSurface }}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default RatingStep;

// ────────────────────────────────────────────────────────── Styles
const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 16,
  },
  label: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  card: {
    width: '28%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  emoji: {
    fontSize: 26,
    marginBottom: 6,
  },
});
