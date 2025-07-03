import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { useTheme } from 'react-native-paper';

export interface RankedVenue {
  venue: string;
  count: number;
}

interface Props {
  title: string;
  data: RankedVenue[];
  variant: 'best' | 'worst';
  onSelect: (venue: string) => void;
}

/**
 * Ranked venue list with medal emojis for top-3 and a proportional bar.
 * Rows are single-line and include a numeric rank for 4-10.
 */
const VenueRankList: React.FC<Props> = ({ title, data, variant, onSelect }) => {
  const theme = useTheme();
  const topCount = data[0]?.count ?? 1;
  const barColor = variant === 'best' ? theme.colors.primary : theme.colors.error;

  return (
    <View
      style={[styles.block, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
      accessibilityRole="summary"
      accessibilityLabel={title}
    >
      <Text style={[styles.blockTitle, { color: theme.colors.outline }]}>{title}</Text>

      <FlatList
        data={data}
        keyExtractor={(v) => v.venue}
        scrollEnabled={false}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => onSelect(item.venue)}
            style={styles.row}
            accessibilityRole="button"
            accessibilityLabel={`Go to review ${item.venue}`}
          >
            {/* Rank / medal */}
            <Text style={styles.rank}>{index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}.`}</Text>

            {/* Venue */}
            <Text
              style={[styles.venueText, { color: theme.colors.onSurface }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.venue}
            </Text>

            {/* Bar */}
            <View style={[styles.barBg, { backgroundColor: `${barColor}22` }]}>
              <View
                style={[
                  styles.barFill,
                  {
                    backgroundColor: barColor,
                    width: `${(item.count / topCount) * 100}%`,
                  },
                ]}
              />
            </View>

            {/* Count */}
            <Text style={[styles.count, { color: theme.colors.onSurface }]}>{item.count}</Text>
          </Pressable>
        )}
      />
    </View>
  );
};

export default VenueRankList;

// ────────────────────────────────────────────────────────── Styles
const styles = StyleSheet.create({
  block: {
    width: '100%',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ffffff22',
  },
  rank: {
    width: 28,
    textAlign: 'center',
    fontSize: 16,
  },
  venueText: {
    flex: 1,
    marginLeft: 4,
    fontSize: 15,
  },
  barBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  count: {
    width: 32,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});