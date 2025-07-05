// components/VenueRankList.tsx
import React from 'react';
import {
  View,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';

/* ───────────────────────────────────────── Types */
export interface RankedVenue {
  venue: string;
  count: number;
}

interface Props {
  title: string;
  data: RankedVenue[];
  /** “best” → gold/silver/bronze medals; “worst” → always numeric ranks */
  variant: 'best' | 'worst';
  /** Callback when user taps a row */
  onSelect: (venue: string) => void;
}

/* ───────────────────────────────────────── Component */
const VenueRankList: React.FC<Props> = ({
  title,
  data,
  variant,
  onSelect,
}) => {
  const theme = useTheme();
  const topCount = data[0]?.count ?? 1; // avoid NaN

  const Row = ({ item, index }: { item: RankedVenue; index: number }) => {
    let label: string;
    if (variant === 'best' && index < 3) {
      label = ['🥇', '🥈', '🥉'][index];
    } else {
      // always numeric rank
      label = `${index + 1}.`;
    }

    return (
      <Pressable
        onPress={() => onSelect(item.venue)}
        style={styles.row}
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.venue} details`}
      >
        <View style={styles.rowLeft}>
          <Text style={[styles.medal, { color: theme.colors.primary }]}>
            {label}
          </Text>
          <Text
            style={[styles.venueText, { color: theme.colors.onSurface }]}
            numberOfLines={1}
          >
            {item.venue}
          </Text>
        </View>

        <View
          style={[
            styles.barBg,
            { backgroundColor: `${theme.colors.primary}33` },
          ]}
        >
          <View
            style={[
              styles.barFill,
              {
                backgroundColor:
                  variant === 'best'
                    ? theme.colors.primary
                    : theme.colors.error,
                width: `${(item.count / topCount) * 100}%`,
              },
            ]}
          />
        </View>

        <Text
          style={[styles.count, { color: theme.colors.onSurface }]}
          numberOfLines={1}
        >
          {item.count}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      style={[styles.block, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
      accessibilityRole="summary"
      accessibilityLabel={title}
    >
      <Text style={[styles.blockTitle, { color: theme.colors.outline }]}>
        {title}
      </Text>

      <FlatList
        data={data}
        keyExtractor={(v) => v.venue}
        renderItem={({ item, index }) => <Row item={item} index={index} />}
        scrollEnabled={false}
      />
    </View>
  );
};

export default VenueRankList;

/* ───────────────────────────────────────── Styles */
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
    marginBottom: 8,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  medal: {
    fontSize: 18,
    marginRight: 4,
  },
  venueText: {
    fontSize: 15,
    flexShrink: 1,
  },
  barBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  count: {
    width: 32,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
    fontSize: 14,
  },
});
