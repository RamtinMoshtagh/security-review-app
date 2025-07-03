import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { useReviewStore } from '../../../store/useReviewStore';

interface AIResult {
  behaviorType: string;
  safetyScore: number;
  tone: string;
}

interface Props {
  ai: AIResult;
  story: string;
}

/**
 * Step 5 – Final recap before submission. Pure display component.
 */
const SummaryStep: React.FC<Props> = ({ ai, story }) => {
  const theme = useTheme();
  const { venue, rating, tags } = useReviewStore();

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>Summary</Text>

      {/* Venue */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionHeader, { color: theme.colors.primary }]}>📍 Venue Info</Text>
        <LabelPair label="Venue" value={venue} />
        <LabelPair label="Rating" value={rating ?? '—'} />
        <LabelPair label="Tags" value={tags.join(', ') || '—'} />
      </View>

      {/* Story */}
      {story.trim().length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionHeader, { color: theme.colors.primary }]}>✍️ Story</Text>
          <Text style={[styles.value, { color: theme.colors.onSurface }]}>{story}</Text>
        </View>
      )}

      {/* AI analysis */}
      <View
        style={[
          styles.section,
          styles.aiBorder,
          { backgroundColor: theme.colors.surface, borderLeftColor: theme.colors.primary },
        ]}
      >
        <Text style={[styles.sectionHeader, { color: theme.colors.primary }]}>🧠 AI Classification</Text>
        <LabelPair label="🔍 Type" value={ai.behaviorType} />
        <LabelPair label="🧮 Score" value={`${ai.safetyScore}/5`} />
        <LabelPair label="🎭 Tone" value={ai.tone} />
      </View>
    </ScrollView>
  );
};

export default SummaryStep;

// ────────────────────────────────────────────────────────── Helpers
function LabelPair({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={{ marginTop: 6 }}>
      <Text style={[styles.label, { color: theme.colors.outline }]}>{label}:</Text>
      <Text style={[styles.value, { color: theme.colors.onSurface }]}>{value}</Text>
    </View>
  );
}

// ────────────────────────────────────────────────────────── Styles
const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
  },
  value: {
    fontWeight: '400',
  },
  aiBorder: {
    borderLeftWidth: 4,
  },
});