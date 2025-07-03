import React from 'react';
import { View, TextInput as RNTextInput, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface Props {
  story: string;
  onChangeStory: (val: string) => void;
}

/**
 * Step 4 – Free‑text story input.
 */
const StoryStep: React.FC<Props> = ({ story, onChangeStory }) => {
  const theme = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.label, { color: theme.colors.onSurface }]}>Want to describe what happened?</Text>

      <RNTextInput
        multiline
        numberOfLines={6}
        placeholder="Write your experience here…"
        placeholderTextColor={theme.colors.outline}
        value={story}
        onChangeText={onChangeStory}
        style={[
          styles.input,
          { color: theme.colors.onSurface, borderColor: theme.colors.outline },
        ]}
      />
    </View>
  );
};

export default StoryStep;

const styles = StyleSheet.create({
  label: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    backgroundColor: '#511730',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
});
