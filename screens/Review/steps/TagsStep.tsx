import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import * as Haptics from 'expo-haptics';

import { useReviewStore } from '../../../store/useReviewStore';

const TAG_OPTIONS = [
  { emoji: '✅', label: 'Respectful' },
  { emoji: '🛡️', label: 'Protected me' },
  { emoji: '🙂', label: 'Friendly' },
  { emoji: '🧘', label: 'Calm' },
  { emoji: '😡', label: 'Aggressive' },
  { emoji: '🧍🏾', label: 'Racial profiling' },
  { emoji: '❌', label: 'Sexist / inappropriate' },
  { emoji: '🥴', label: 'Drunk' },
  { emoji: '🔈', label: 'Yelled / Power tripping' },
  { emoji: '🚷', label: 'Prevented entry for no reason' },
] as const;

/**
 * Step 3 – Multi‑select behaviour tags.
 */
const TagsStep: React.FC = () => {
  const theme = useTheme();
  const { tags, toggleTag } = useReviewStore();

  const renderItem = ({ item }: { item: (typeof TAG_OPTIONS)[number] }) => {
    const selected = tags.includes(item.label);
    return (
      <Pressable
        onPress={() => {
          toggleTag(item.label);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        style={[
          styles.card,
          { backgroundColor: selected ? theme.colors.primary : theme.colors.surface },
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={`Toggle tag ${item.label}`}
      >
        <Text style={styles.emoji}>{item.emoji}</Text>
        <Text style={{ color: theme.colors.onSurface, textAlign: 'center' }}>{item.label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={TAG_OPTIONS}
        keyExtractor={(item) => item.label}
        numColumns={2}
        ListHeaderComponent={
          <Text style={[styles.label, { color: theme.colors.onSurface }]}>What behaviour did you notice?</Text>
        }
        renderItem={renderItem}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
};

export default TagsStep;

// ────────────────────────────────────────────────────────── Styles
const styles = StyleSheet.create({
  label: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
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
  emoji: {
    fontSize: 26,
    marginBottom: 6,
  },
});
