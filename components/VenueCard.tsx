import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  GestureResponderEvent,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import StackedBar from './StackedBar';

/* ───────────────────────────────────────── Types */
export interface VenueCounts {
  name:  string;
  good:  number;
  okay:  number;
  bad:   number;
  total: number;
}

interface Props {
  counts: VenueCounts;
  onPress: (e: GestureResponderEvent) => void;
}

/* ───────────────────────────────────────── Card */
const VenueCard: React.FC<Props> = ({ counts, onPress }) => {
  const theme = useTheme();
  const { name, good, okay, bad, total } = counts;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open details for ${name}`}
    >
      {/* Title */}
      <Text
        style={[styles.title, { color: theme.colors.onSurface }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {name}
      </Text>

      {/* Stacked bar + review-count */}
      <View style={styles.metaRow}>
        <StackedBar good={good} okay={okay} bad={bad} />

        <Text style={[styles.countTxt, { color: theme.colors.outline }]}>
          • {total} {total === 1 ? 'review' : 'reviews'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default VenueCard;

/* ───────────────────────────────────────── Styles */
const styles = StyleSheet.create({
  card: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countTxt: {
    marginLeft: 8,
    fontSize: 14,
  },
});
