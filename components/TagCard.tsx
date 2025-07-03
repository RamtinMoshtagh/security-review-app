import React from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle, Text } from 'react-native';
import { useTheme } from 'react-native-paper';

interface Props {
  emoji: string;
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Reusable selectable card displaying an emoji and label.
 * Meets 48 × 48 dp accessibility target via min‐size styles.
 */
const TagCard: React.FC<Props> = ({ emoji, label, selected = false, onPress, style }) => {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: selected ? theme.colors.primary : theme.colors.surface },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, { color: theme.colors.onSurface }]}>{label}</Text>
    </Pressable>
  );
};

export default TagCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    minHeight: 48,
  },
  emoji: {
    fontSize: 26,
    marginBottom: 6,
  },
  label: {
    textAlign: 'center',
    fontWeight: '600',
  },
});
